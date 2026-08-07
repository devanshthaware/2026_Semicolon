export function isBootstrapAuthorized(value: string | null) {
  const expected = process.env.ARGUS_BOOTSTRAP_TOKEN;
  return Boolean(expected && value && value === expected);
}
