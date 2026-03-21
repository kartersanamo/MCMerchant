type SemverParts = { major: number; minor: number; patch: number };

function parseSemver(input: string): SemverParts {
  // Accept "x.y.z" (optionally missing patch) and ignore pre-release/build.
  const [core] = input.split("+");
  const [base] = core.split("-");
  const parts = base.split(".");
  const major = Number(parts[0] ?? 0);
  const minor = Number(parts[1] ?? 0);
  const patch = Number(parts[2] ?? 0);
  return { major, minor, patch };
}

export function compareSemver(a: string, b: string): number {
  const pa = parseSemver(a);
  const pb = parseSemver(b);

  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  return pa.patch - pb.patch;
}

export function isSemverGreater(a: string, b: string): boolean {
  return compareSemver(a, b) > 0;
}

