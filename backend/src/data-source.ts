import { DataSource } from "typeorm";
import { User } from "./database/entities/user.entity";
import { Challenge } from "./database/entities/challenge.entity";
import { Solve } from "./database/entities/solve.entity";
import { ChallengeAttempt } from "./database/entities/challenge-attempt.entity";
import { ActivityLog } from "./database/entities/activity-log.entity";
import { Category } from "./database/entities/category.entity";
import { Team } from "./database/entities/team.entity";
import { Event } from "./database/entities/event.entity";
import { FirstBlood } from "./database/entities/first-blood.entity";
import { HintUsage } from "./database/entities/hint-usage.entity";
import { Submission } from "./database/entities/submission.entity";
import { Ban } from "./database/entities/ban.entity";
import { Announcement } from "./database/entities/announcement.entity";

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: process.env.DB_PATH || "./cyberhack.db",
    synchronize: true,
    logging: false,
    entities: [
        User, Challenge, Solve, ChallengeAttempt, ActivityLog, Category,
        Team, Event, FirstBlood, HintUsage, Submission, Ban, Announcement
    ],
    migrations: [],
    subscribers: [],
});

