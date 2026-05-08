-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RoutineBlock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "routineId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "ropeId" INTEGER,
    "ropeChangeTime" INTEGER NOT NULL DEFAULT 30,
    CONSTRAINT "RoutineBlock_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoutineBlock_ropeId_fkey" FOREIGN KEY ("ropeId") REFERENCES "Rope" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RoutineBlock" ("id", "name", "order", "ropeId", "routineId") SELECT "id", "name", "order", "ropeId", "routineId" FROM "RoutineBlock";
DROP TABLE "RoutineBlock";
ALTER TABLE "new_RoutineBlock" RENAME TO "RoutineBlock";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
