import { prisma } from "@/lib/prisma";

/**
 * Terminates a user by employeeId.
 * Sets status to INACTIVE and dateOfTermination to now.
 * @param employeeId - The employeeId string (e.g., "MT123456")
 * @returns The updated user or null if not found.
 */
export async function terminateUserByEmployeeId(employeeId: string) {
  // Try to find the userId from all possible employee tables
  const manager = await prisma.manager.findUnique({ where: { employeeId } });
  if (manager) return terminateUser(manager.userId);

  const technician = await prisma.technician.findUnique({ where: { employeeId } });
  if (technician) return terminateUser(technician.userId);

  const fieldExecutive = await prisma.fieldExecutive.findUnique({ where: { employeeId } });
  if (fieldExecutive) return terminateUser(fieldExecutive.userId);

  const salesExecutive = await prisma.salesExecutive.findUnique({ where: { employeeId } });
  if (salesExecutive) return terminateUser(salesExecutive.userId);

  // Not found
  return null;
}

async function terminateUser(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      status: "INACTIVE",
      dateOfTermination: new Date(),
    },
  });
}
