#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const METHODS = ['get', 'put', 'post', 'delete', 'patch', 'options', 'head'];

const swaggerPath = process.argv[2] || 'packages/nocodb/src/schema/swagger-v2.json';

const resolvedSwaggerPath = path.resolve(process.cwd(), swaggerPath);
if (!fs.existsSync(resolvedSwaggerPath)) {
  console.error(`Swagger file not found at ${resolvedSwaggerPath}`);
  process.exit(1);
}

const swagger = JSON.parse(fs.readFileSync(resolvedSwaggerPath, 'utf-8'));

const resolveRef = (ref) => {
  if (!ref || typeof ref !== 'string' || !ref.startsWith('#/')) return null;
  return ref
    .replace(/^#\//, '')
    .split('/')
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), swagger);
};

const describeSchema = (schema) => {
  if (!schema) return null;
  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref);
    const title = resolved?.title;
    if (title) return title;
    return schema.$ref.split('/').pop();
  }
  if (schema.oneOf) return schema.oneOf.map(describeSchema).filter(Boolean).join(' | ');
  if (schema.anyOf) return schema.anyOf.map(describeSchema).filter(Boolean).join(' | ');
  if (schema.allOf) return schema.allOf.map(describeSchema).filter(Boolean).join(' & ');
  if (schema.type === 'array') {
    return `array<${describeSchema(schema.items) || 'unknown'}>`;
  }
  let text = schema.type || 'object';
  if (schema.format) text += `(${schema.format})`;
  return text;
};

const flattenParams = (params = []) =>
  params
    .map((param) => {
      if (param.$ref) {
        const resolved = resolveRef(param.$ref);
        return resolved || null;
      }
      return param;
    })
    .filter(Boolean);

const groupParams = (params = []) => {
  const grouped = {
    path: [],
    query: [],
    header: [],
    cookie: [],
    other: [],
  };
  flattenParams(params).forEach((param) => {
    const key = grouped[param.in] ? param.in : 'other';
    grouped[key].push(param);
  });
  return grouped;
};

const isAuthParam = (param) => {
  if (!param) return false;
  if (param.name && param.name.toLowerCase().includes('xc-auth')) return true;
  if (param.$ref && param.$ref.includes('xc-auth')) return true;
  if (param.description && param.description.toLowerCase().includes('xc-auth')) return true;
  return false;
};

const summarizeExamples = (examples) => {
  if (!examples) return null;
  const keys = Object.keys(examples);
  if (!keys.length) return null;
  const sampleKey = keys[0];
  const sample = examples[sampleKey];
  if (sample?.summary) return sample.summary;
  if (sample?.description) return sample.description;
  if (sample?.value) {
    try {
      const value = sample.value;
      if (typeof value === 'string') {
        return value.length > 80 ? `${value.slice(0, 77)}...` : value;
      }
      const json = JSON.stringify(value);
      return json.length > 80 ? `${json.slice(0, 77)}...` : json;
    } catch (e) {
      return null;
    }
  }
  return null;
};

const summarizeRequestBody = (requestBody) => {
  if (!requestBody) return null;
  const entries = Object.entries(requestBody.content || {});
  if (!entries.length) return null;
  return entries
    .map(([contentType, spec]) => {
      const schemaDesc = describeSchema(spec.schema) || 'object';
      const exampleText = summarizeExamples(spec.examples);
      return `\`${contentType}\` → ${schemaDesc}${exampleText ? ` (ex: ${exampleText})` : ''}`;
    })
    .join('; ');
};

const summarizeResponses = (responses = {}) => {
  const successCodes = Object.keys(responses).filter((code) => code.startsWith('2'));
  if (!successCodes.length) return null;
  return successCodes
    .map((code) => {
      const resp = responses[code];
      if (!resp) return `\`${code}\``;
      const description = resp.description ? ` ${resp.description.trim()}` : '';
      const contentEntries = Object.entries(resp.content || {});
      if (!contentEntries.length) return `\`${code}\`${description}`;
      const contentDescriptions = contentEntries
        .map(([ctype, spec]) => {
          const schemaDesc = describeSchema(spec.schema) || 'object';
          return `\`${ctype}\` → ${schemaDesc}`;
        })
        .join(', ');
      return `\`${code}\`${description} (${contentDescriptions})`;
    })
    .join('; ');
};

const endpointMap = {};

Object.entries(swagger.paths || {}).forEach(([route, pathObj]) => {
  const commonParams = pathObj.parameters || [];
  Object.entries(pathObj).forEach(([method, operation]) => {
    if (!METHODS.includes(method)) return;
    const tags = operation.tags?.length ? operation.tags : ['Untagged'];
    const params = [...commonParams, ...(operation.parameters || [])];
    tags.forEach((tag) => {
      if (!endpointMap[tag]) endpointMap[tag] = [];
      endpointMap[tag].push({
        method: method.toUpperCase(),
        route,
        summary: operation.summary || '',
        description: operation.description || '',
        params,
        requestBody: operation.requestBody,
        responses: operation.responses,
        security: operation.security,
        operationId: operation.operationId,
      });
    });
  });
});

const tagGroups = swagger['x-tagGroups'] || [];
const orderedTags = tagGroups.flatMap((group) => group.tags) || [];
Object.keys(endpointMap).forEach((tag) => {
  if (!orderedTags.includes(tag)) orderedTags.push(tag);
});

const docLines = [];

docLines.push('# NocoDB REST API Reference (v2)');
docLines.push('');
docLines.push(
  `Source schema: \`${path.relative(process.cwd(), resolvedSwaggerPath)}\` (OpenAPI ${
    swagger.openapi || '3.x'
  }).`
);
docLines.push('');
docLines.push('## Usage Essentials');
docLines.push('');
docLines.push('- Base URL: `http://<your-nocodb-host>:8080` by default.');
docLines.push(
  '- Authentication: obtain a JWT via `POST /api/v1/auth/user/signin` or API token, then send it as `xc-auth` header (`xc-auth: <token>`).'
);
docLines.push(
  '- All endpoints are namespaced under `/api/v1` or `/api/v2`. Meta endpoints typically live under `/api/v2/meta`, data endpoints under `/api/v2/tables` or `/api/v2/views`.'
);
docLines.push(
  '- Standard request headers: `Content-Type: application/json`, `xc-auth` (if required).'
);
docLines.push(
  '- Pagination pattern: query params `page`, `pageSize`, `sort`, `where` depending on endpoint; responses return `pageInfo` objects.'
);
docLines.push('');
docLines.push('### cURL Quickstart');
docLines.push('');
docLines.push('```bash');
docLines.push('# Sign in and capture the xc-auth token');
docLines.push('TOKEN=$(curl -s -X POST \\');
docLines.push('  https://your-nocodb.example.com/api/v1/auth/user/signin \\');
docLines.push('  -H "Content-Type: application/json" \\');
docLines.push('  -d \'{"email":"user@example.com","password":"Password"}\' | jq -r .token)');
docLines.push('');
docLines.push('# List tables inside a base');
docLines.push('curl -s \\');
docLines.push('  -H "xc-auth: $TOKEN" \\');
docLines.push('  https://your-nocodb.example.com/api/v2/meta/bases/p_124hhlkbeasewh/tables');
docLines.push('```');
docLines.push('');

tagGroups.forEach((group) => {
  docLines.push(`## ${group.name}`);
  docLines.push('');
  group.tags.forEach((tag) => {
    const entries = endpointMap[tag];
    if (!entries || !entries.length) return;
    docLines.push(`### ${tag}`);
    docLines.push('');
    entries
      .sort((a, b) => `${a.route}-${a.method}`.localeCompare(`${b.route}-${b.method}`))
      .forEach((entry) => {
        const groupedParams = groupParams(entry.params);
        const requiresAuth =
          (entry.security && entry.security.length > 0) ||
          groupedParams.header.some(isAuthParam);
        docLines.push(
          `#### \`${entry.method} ${entry.route}\`${entry.summary ? ` — ${entry.summary}` : ''}`
        );
        if (entry.description) {
          docLines.push(entry.description.trim());
        }
        docLines.push('');
        docLines.push(`- Auth: ${requiresAuth ? 'Required' : 'Optional / Public'}`);
        docLines.push(`- Operation ID: \`${entry.operationId || 'n/a'}\``);
        ['path', 'query', 'header', 'cookie'].forEach((location) => {
          if (!groupedParams[location].length) return;
          const rendered = groupedParams[location]
            .map((param) => {
              const schemaDesc = describeSchema(param.schema);
              const pieces = [`\`${param.name}\``];
              if (schemaDesc) pieces.push(schemaDesc);
              if (param.required) pieces.push('required');
              const desc = param.description ? ` — ${param.description}` : '';
              return `${pieces.join(' · ')}${desc}`;
            })
            .join('; ');
          docLines.push(`- ${location[0].toUpperCase() + location.slice(1)} params: ${rendered}`);
        });
        const bodyDesc = summarizeRequestBody(entry.requestBody);
        docLines.push(`- Request body: ${bodyDesc || 'n/a'}`);
        const responseDesc = summarizeResponses(entry.responses);
        docLines.push(`- Success responses: ${responseDesc || 'n/a'}`);
        docLines.push('');
      });
  });
});

orderedTags.forEach((tag) => {
  if (tagGroups.some((group) => group.tags.includes(tag))) return;
  const entries = endpointMap[tag];
  if (!entries || !entries.length) return;
  docLines.push(`## ${tag}`);
  docLines.push('');
  entries
    .sort((a, b) => `${a.route}-${a.method}`.localeCompare(`${b.route}-${b.method}`))
    .forEach((entry) => {
      const groupedParams = groupParams(entry.params);
      const requiresAuth =
        (entry.security && entry.security.length > 0) ||
        groupedParams.header.some(isAuthParam);
      docLines.push(
        `#### \`${entry.method} ${entry.route}\`${entry.summary ? ` — ${entry.summary}` : ''}`
      );
      if (entry.description) {
        docLines.push(entry.description.trim());
      }
      docLines.push('');
      docLines.push(`- Auth: ${requiresAuth ? 'Required' : 'Optional / Public'}`);
      docLines.push(`- Operation ID: \`${entry.operationId || 'n/a'}\``);
      ['path', 'query', 'header', 'cookie'].forEach((location) => {
        if (!groupedParams[location].length) return;
        const rendered = groupedParams[location]
          .map((param) => {
            const schemaDesc = describeSchema(param.schema);
            const pieces = [`\`${param.name}\``];
            if (schemaDesc) pieces.push(schemaDesc);
            if (param.required) pieces.push('required');
            const desc = param.description ? ` — ${param.description}` : '';
            return `${pieces.join(' · ')}${desc}`;
          })
          .join('; ');
        docLines.push(`- ${location[0].toUpperCase() + location.slice(1)} params: ${rendered}`);
      });
      const bodyDesc = summarizeRequestBody(entry.requestBody);
      docLines.push(`- Request body: ${bodyDesc || 'n/a'}`);
      const responseDesc = summarizeResponses(entry.responses);
      docLines.push(`- Success responses: ${responseDesc || 'n/a'}`);
      docLines.push('');
    });
});

process.stdout.write(docLines.join('\n'));
