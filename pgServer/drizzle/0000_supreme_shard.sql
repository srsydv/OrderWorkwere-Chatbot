CREATE TABLE "chat_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"fullname" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"profile_pic" text DEFAULT 'https://via.placeholder.com/150',
	"bio" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chat_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender" uuid NOT NULL,
	"receiver" uuid NOT NULL,
	"text" text,
	"image" text,
	"seen" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_chat_users_id_fk" FOREIGN KEY ("sender") REFERENCES "public"."chat_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_chat_users_id_fk" FOREIGN KEY ("receiver") REFERENCES "public"."chat_users"("id") ON DELETE no action ON UPDATE no action;