# Mortar bot privacy policy

Effective 19 October 2026.

The Mortar bot is the Discord app Rethunk.Tech uses on the Mortar Mod Manager Discord server. It is installed in that one server; nobody else can add it. This policy covers the bot only. [Mortar's privacy policy](/privacy/) covers the app; [Discord's](https://discord.com/privacy) covers Discord.

## What the bot reads, and why

| What | Why |
| --- | --- |
| The server's settings, channels, categories, roles, permissions, onboarding, welcome screen, AutoMod rules and events | To keep the server as its maintainers decided |
| Who is in the server: user IDs, usernames, display names, nicknames, roles, account age, and when members join or leave | Welcome, roles, moderator actions and the moderators' log |
| Messages in channels the bot can see, including edits and deletions | Requests to the bot, private tickets, and the moderators' log of edits and deletions |
| The server's audit log | To record which moderator changed a member's roles |

The bot does not receive members' online status.

Discord sends this as the server is used. The bot acts on it as it arrives and does not keep it, except as below.

## What the bot keeps

The bot keeps a short-lived local cache of recent messages and member names on Rethunk.Tech's own machine, to log edits and deletions and to reduce requests to Discord. Message text leaves the cache after 30 days. A member's names and roles, and the names they used before (username, display name and nickname changes the bot has seen), stay while they are in the server. A list of the moderation actions taken through the bot (which action, by whom, and when) is kept for as long as the case threads below. None of it is shared.

In staff-only channels on the server, the bot posts:

- a log of edited and deleted messages (with their text), name changes, joins and leaves, and role changes with who made them, kept indefinitely so moderators can look back;
- each ban, kick and timeout made through the bot, with the moderator and the reason;
- one thread per member who has needed moderation, with those actions and moderators' notes. Each entry includes a snapshot of the member: their names and previous names, roles, join and account dates, status such as a timeout or having rejoined, their earlier moderation record, and their last few messages still in the cache, and any message a moderator wrote them up for.

A private ticket is a thread only its member and staff can see, and stays in the server after it is closed.

Server layout (channel, role and rule names and IDs, and the bot's own posts) lives in a private Rethunk.Tech repository for review.

## Sharing

Nothing the bot reads is sold, shared, used for advertising or used to train AI models. Discord processes it as the platform.

## Your choices

Leaving the server stops the bot reading anything new about you; what is already in the moderators' log stays unless you ask for it to be removed. To ask what it holds or to have it removed: [legal@rethunk.tech](mailto:legal@rethunk.tech). Audit log entries follow Discord's retention.

## Changes

A change to what the bot reads or keeps updates this page and its date before the bot starts doing it.
