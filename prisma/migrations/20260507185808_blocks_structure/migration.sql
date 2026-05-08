/*
  Warnings:

  - You are about to drop the column `ropeId` on the `RoutineStep` table. All the data in the column will be lost.
  - You are about to drop the column `routineId` on the `RoutineStep` table. All the data in the column will be lost.
  - Added the required column `blockId` to the `RoutineStep` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "RoutineBlock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "routineId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "ropeId" INTEGER,
    CONSTRAINT "RoutineBlock_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoutineBlock_ropeId_fkey" FOREIGN KEY ("ropeId") REFERENCES "Rope" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RoutineStep" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "blockId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "exerciseId" INTEGER,
    "jumpTypeId" INTEGER,
    CONSTRAINT "RoutineStep_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "RoutineBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoutineStep_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RoutineStep_jumpTypeId_fkey" FOREIGN KEY ("jumpTypeId") REFERENCES "JumpType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RoutineStep" ("duration", "exerciseId", "id", "jumpTypeId", "order", "type") SELECT "duration", "exerciseId", "id", "jumpTypeId", "order", "type" FROM "RoutineStep";
DROP TABLE "RoutineStep";
ALTER TABLE "new_RoutineStep" RENAME TO "RoutineStep";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
