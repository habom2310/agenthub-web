import { eq, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { packages, users, type Package, type User, type PublicPackage } from "@/lib/db/schema";

function toPublic(row: { packages: Package; users: User | null }): PublicPackage {
  const { publisherId, githubRepoId, ...rest } = row.packages;
  return {
    ...rest,
    publisher: row.users ? { login: row.users.login, avatarUrl: row.users.avatarUrl } : null,
  };
}

async function query(where?: SQL): Promise<PublicPackage[]> {
  const rows = await db
    .select()
    .from(packages)
    .leftJoin(users, eq(users.id, packages.publisherId))
    .where(where);
  return rows.map(toPublic);
}

export const listPackages = () => query();

export async function getPackage(id: string): Promise<PublicPackage | null> {
  return (await query(eq(packages.id, id)))[0] ?? null;
}

// Packages this user published
export const listPackagesFor = (user: { id: number }) => query(eq(packages.publisherId, user.id));
