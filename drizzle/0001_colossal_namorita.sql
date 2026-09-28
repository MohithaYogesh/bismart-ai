CREATE TABLE `knowledgeDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`sourceUrl` varchar(500) NOT NULL,
	`sourceOrganization` varchar(160) NOT NULL,
	`category` varchar(120) NOT NULL,
	`textChunks` text NOT NULL,
	`metadata` text,
	`status` enum('indexed','review','failed') NOT NULL DEFAULT 'indexed',
	`lastUpdated` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `knowledgeDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productScans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`productName` varchar(255),
	`imageUrl` text,
	`ocrText` text,
	`extractedFields` text,
	`claims` text,
	`complianceStatus` enum('supported','review','issue') NOT NULL DEFAULT 'review',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productScans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`scanId` int,
	`productName` varchar(255),
	`reportUrl` text,
	`summary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userQueries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`query` text NOT NULL,
	`intent` varchar(80),
	`response` text,
	`sources` text,
	`status` enum('answered','needs_detail','unknown') NOT NULL DEFAULT 'answered',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userQueries_id` PRIMARY KEY(`id`)
);
