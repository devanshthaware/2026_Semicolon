export function isBootstrapAuthorized(value: string | null) {
  const expected = process.env.TRUTHLAYER_BOOTSTRAP_TOKEN;
  return Boolean(expected && value && value === expected);
}
