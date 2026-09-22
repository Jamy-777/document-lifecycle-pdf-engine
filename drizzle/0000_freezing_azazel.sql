CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`previous_state` text NOT NULL,
	`next_state` text NOT NULL,
	`actor` text NOT NULL,
	`timestamp` integer NOT NULL,
	`note` text,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`title` text NOT NULL,
	`created_by` text NOT NULL,
	`state` text DEFAULT 'DRAFT' NOT NULL,
	`data` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
