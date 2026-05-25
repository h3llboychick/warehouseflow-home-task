function omitUndefinedEntries(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  );
}

export function serializeError(error) {
  if (!error) {
    return undefined;
  }

  return omitUndefinedEntries({
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
    status_code: error.statusCode
  });
}

function writeLog(level, event, fields = {}) {
  const entry = omitUndefinedEntries({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...fields
  });

  const line = `${JSON.stringify(entry)}\n`;
  const stream = level === "error" ? process.stderr : process.stdout;
  stream.write(line);
}

export function logInfo(event, fields) {
  writeLog("info", event, fields);
}

export function logError(event, fields) {
  writeLog("error", event, fields);
}
