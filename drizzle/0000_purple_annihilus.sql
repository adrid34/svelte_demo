CREATE TABLE "github_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(64) NOT NULL,
	"data" jsonb NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "github_cache_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"age" integer
);
