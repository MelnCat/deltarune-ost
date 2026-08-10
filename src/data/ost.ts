import { equalsNormalized, includesNormalized, normalizeText } from "#/util/text";

const songs = import.meta.glob("./*", { base: "../assets/music", eager: true });
const sounds = import.meta.glob("./*", { base: "../assets/audiogroup_default", eager: true });
const extras = import.meta.glob("./*", { base: "../assets/extra", eager: true });

export class Track {
	readonly name: string;
	readonly normalizedName: string;
	readonly filename: string;
	readonly album: string[];
	readonly paths: string[];
	readonly chapters: number[];
	readonly responses: Record<string, string>;
	whenPlay: (input: string, normalized: string) => boolean;
	matches: (input: string, normalized: string) => boolean;
	messageFor: (input: string, normalized: string) => string;

	constructor(args: TrackArgs) {
		this.name = args.name;
		this.normalizedName = normalizeText(args.name);
		this.filename = args.filename;
		this.album = typeof args.album === "string" ? [args.album] : args.album;
		this.paths = this.filename.split(", ").map(x => {
			const found = songs[`./${x}.ogg`] ?? sounds[`./${x}.wav`] ?? extras[`./${x}.wav`] ?? extras[`./${x}.flac`];
			if (!found && x === "snd_usefountain") {
				throw new Error("yeah you forgot snd_usefountain. it's in the chapter folders");
			}
			if (!found) {
				console.warn(`No ${x}`);
				return "";
			}
			return (found as { default: string }).default;
		});
		this.chapters = args.chapters ?? [];
		this.responses = args.responses ?? {};
		this.whenPlay = args.whenPlay ?? (() => true);
		this.matches = args.matches ?? ((input, normalized) => equalsNormalized(normalized, this.normalizedName));
		this.messageFor =
			args.messageFor ??
			((input, normalized) =>
				normalized in this.responses ? this.responses[normalized].replaceAll("{input}", input) : `"${input}" is incorrect.`);
	}
}

interface TrackArgs {
	name: string;
	filename: string;
	album: string | string[];
	chapters?: number[];
	responses?: Record<string, string>;
	whenPlay?(this: Track, input: string, normalized: string): boolean;
	matches?(this: Track, input: string, normalized: string): boolean;
	messageFor?: (input: string, normalized: string) => string;
}

export const tracks: Track[] = [];

export const tracksByName: Record<string, Track> = {};

const register = (args: TrackArgs) => {
	const track = new Track(args);
	tracks.push(track);
	tracksByName[args.name] = track;
};

register({ name: "A Town Called Hometown", filename: "town", album: "DELTARUNE Chapter 1 OST", chapters: [1, 2] });
register({ name: "ANOTHER HIM", filename: "AUDIO_ANOTHERHIM", album: "DELTARUNE Chapter 1 OST" });
register({ name: "April 2012", filename: "april_2012", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Basement", filename: "basement", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Before the Story", filename: "AUDIO_STORY", album: ["DELTARUNE Chapter 1 OST", "DELTARUNE Chapter 2 OST"] });
register({ name: "Beginning", filename: "mus_introcar", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Card Castle", filename: "card_castle", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Chaos King", filename: "kingboss", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Checker Dance", filename: "checkers", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Cliffs", filename: "creepylandscape", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Darkness Falls", filename: "AUDIO_DARKNESS", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Don't Forget", filename: "dontforget", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Empty Town", filename: "castletown_empty", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Fanfare (from Rose of Winter)", filename: "fanfare", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Field of Hopes and Dreams", filename: "field_of_hopes", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Friendship", filename: "friendship", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Gallery", filename: "GALLERY", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Hip Shop", filename: "hip_shop", album: "DELTARUNE Chapter 1 OST" });
register({ name: "I'm Very Bad", filename: "lancer_susie", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Imminent Death", filename: "tense", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Lancer", filename: "lancer", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Lantern", filename: "shop1", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Quiet Autumn", filename: "quiet_autumn", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Rouxls Kaard", filename: "ruruskaado", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Rude Buster", filename: "battle", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Scarlet Forest", filename: "forest", album: "DELTARUNE Chapter 1 OST" });
register({ name: "School", filename: "mus_school", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Susie", filename: "s_neo", album: "DELTARUNE Chapter 1 OST" });
register({ name: "The Chase", filename: "creepychase", album: "DELTARUNE Chapter 1 OST" });
register({ name: "The Circus", filename: "prejoker", album: "DELTARUNE Chapter 1 OST" });
register({ name: "The Door", filename: "creepydoor", album: "DELTARUNE Chapter 1 OST" });
register({ name: "THE HOLY", filename: "THE_HOLY", album: "DELTARUNE Chapter 1 OST" });
register({ name: "The Legend", filename: "legend", album: "DELTARUNE Chapter 1 OST" });
register({ name: "THE WORLD REVOLVING", filename: "joker", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Thrash Machine", filename: "thrashmachine", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Vs. Lancer", filename: "lancerfight", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Vs. Susie", filename: "vs_susie", album: "DELTARUNE Chapter 1 OST" });
register({ name: "Weird Birds", filename: "bird", album: "DELTARUNE Chapter 1 OST" });
register({ name: "You Can Always Come Home", filename: "home", album: ["DELTARUNE Chapter 1 OST", "DELTARUNE Chapter 2 OST"] });
register({
	name: "Your Power",
	filename: "snd_usefountain",
	album: "DELTARUNE Chapter 1 OST",
});
register({ name: "A CYBER'S WORLD?", filename: "cyber", album: "DELTARUNE Chapter 2 OST" });
register({ name: "A Real Boy!", filename: "spamton_happy", album: "DELTARUNE Chapter 2 OST" });
register({ name: "A Simple Diversion", filename: "boxing_game", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Acid Tunnel of Love", filename: "acid_tunnel", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Almost To The Guys!", filename: "cyber_battle_prelude", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Attack of the Killer Queen", filename: "queen_boss", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Berdly", filename: "berdly_theme", album: "DELTARUNE Chapter 2 OST" });
register({
	name: "Berdly (Rejected Concept)",
	filename: "berdlyrejected",
	album: "DELTARUNE Chapter 2 OST",
	matches(input, normalized) {
		return includesNormalized(normalized, this.name) && input.toLowerCase().includes("rejected");
	},
});
register({ name: "BIG SHOT", filename: "spamton_neo_mix_ex_wip", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Bluebird of Misfortune", filename: "berdly_flashback", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Chill Jailbreak Alarm To Study And Relax To", filename: "napsta_alarm", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Cool Beat", filename: "music_guys_intro", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Cool Mixtape", filename: "queen_car_radio", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Cyber Battle (Solo)", filename: "cyber_battle_backing_solo", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Deal Gone Wrong", filename: "spamton_neo_meeting", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Dialtone", filename: "spamton_neo_after", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Digital Roots", filename: "spamton_basement", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Elegant Entrance", filename: "mansion_entrance", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Faint Courage (Game Over)", filename: "AUDIO_DEFEAT", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Faint Glow", filename: "menu", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Ferris Wheel", filename: "noelle_ferriswheel", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Giga Size", filename: "giant_queen_appears", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Girl Next Door", filename: "noelle_school", album: "DELTARUNE Chapter 2 OST" });
register({ name: "HEY EVERY !", filename: "spamton_meeting_intro", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Holiday Studio", filename: "cybershop_christmas", album: "DELTARUNE Chapter 2 OST" });
register({ name: 'It\'s Pronounced "Rules"', filename: "rouxls_battle", album: "DELTARUNE Chapter 2 OST" });
register({ name: "KEYGEN", filename: "KEYGEN", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Knock You Down !!", filename: "boxing_boss", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Lost Girl", filename: "noelle_normal", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Mini Studio", filename: "cyberhouse", album: "DELTARUNE Chapter 2 OST" });
register({ name: "My Castle Town", filename: "castletown", album: "DELTARUNE Chapter 2 OST" });
register({ name: "NOW'S YOUR CHANCE TO BE A", filename: "spamton_battle", album: "DELTARUNE Chapter 2 OST" });
register({
	name: "Ohhhhohohoho!",
	filename: "queen_intro",
	album: "DELTARUNE Chapter 2 OST",
	matches(input, normalized) {
		return (
			normalized.length > 5 &&
			normalized.match(/^[oh]+$/) !== null &&
			normalized.split("").filter(x => x === "o").length > 3 &&
			normalized.split("").filter(x => x === "h").length > 3 &&
			normalized.startsWith("o")
		);
	},
});
register({ name: "Pandora Palace", filename: "mansion", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Powers Combined", filename: "gigaqueen_pre", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Queen", filename: "queen", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Sans.", filename: "muscle", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Smart Race", filename: "berdly_chase", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Sound Studio", filename: "cyber_shop", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Spamton", filename: "spamton_meeting", album: "DELTARUNE Chapter 2 OST" });
register({ name: "The Dark Truth", filename: "the_dark_truth", album: "DELTARUNE Chapter 2 OST" });
register({ name: "Until Next Time", filename: "ch2_credits", album: "DELTARUNE Chapter 2 OST" });
register({ name: "WELCOME TO THE CITY", filename: "cybercity", album: "DELTARUNE Chapter 2 OST" });
register({ name: "When I Get Happy I Dance Like This", filename: "cyber_battle_end", album: "DELTARUNE Chapter 2 OST" });
register({ name: "When I Get Mad I Dance Like This", filename: "music_guys", album: "DELTARUNE Chapter 2 OST" });
register({ name: "12am", filename: "church_lw_night", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "13am", filename: "tin_night", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "A DARK ZONE", filename: "pumpkin_boss", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Adventure Board", filename: "board_zelda", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "AIRWAVES", filename: "spamton_dance", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "And Now For Today's Sponsors...!", filename: "baci_perugina", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Another day in hometown", filename: "town_day", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "ATRIUM", filename: "darkchurch_intro", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Big City Board", filename: "ch3_board3", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "BIT ROOTS", filename: "root_8bit", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Black Knife", filename: "knight", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Board Clear!", filename: "snd_nes_intro, nes_intro_extended_part2", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Breath", filename: "knight_appears", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "BURNING EYES", filename: "nightmare_boss_heavy", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "C", filename: "carol_appeared", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Castle Funk", filename: "castle_funk_long", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Catswing", filename: "mike", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Concert for you", filename: "snd_pianonoise", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Crickets", filename: "night_ambience", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Crumbling Tower", filename: "titan_tower", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Dark Place", filename: "dark_place", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Dark Sanctuary", filename: "church_wip", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Dig! Dig! To The Center of the Earth!", filename: "board_lancer_dig", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Doom Board", filename: "board_4", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Dump", filename: "tv_changingroom", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "ERAM", filename: "nightmare_nes", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Ever Higher", filename: "climb", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Feature Presentation", filename: "tennaIntroF1_compressed_28", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Fireplace", filename: "church_dark_study", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Flashback (Excerpt)", filename: "flashback_excerpt", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Friends", filename: "susie_diner", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "From Now On (Battle 2)", filename: "ch4_battle", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Gingerbread House", filename: "noelle_house_wip", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "GLACEIR", filename: "glacier", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Glowing Snow", filename: "tv_results_screen", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "GUARDIAN", filename: "titan_battle", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Gyaa Ha ha!", filename: "gerson_theme_intro", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Hall of Fame", filename: "tv_hall_of_fame", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Hammer of Justice", filename: "ch4_extra_boss", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Heavy Footsteps", filename: "titan_pre", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Hymn", filename: "church_hymn", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "It's TV Time!", filename: "tenna_battle", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "KING OF ROLYPOLY", filename: "trank", album: "DELTARUNE Chapters 3+4 OST", responses: { trank: `It's not "{input}".` } });
register({
	name: "Knock You Down!! (Rhythm Ver.)",
	filename: "rhythm_knockdown_combined",
	album: "DELTARUNE Chapters 3+4 OST",
	matches(input, normalized) {
		return includesNormalized(normalized, this.name) && input.toLowerCase().includes("rhythm");
	},
});
register({ name: "Metaphysical Challenge", filename: "board_4_challenge", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "MIKE, the BOARD, please!", filename: "ch3_tvtime", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Mysterious Ringing", filename: "bell_ambience", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Need a hand!?", filename: "oldman_helps_out", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Neverending Night", filename: "ch4_credits", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "NORTHERNLIGHT", filename: "northernlight", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Old wooden rafters", filename: "church_lw", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Paradise, Paradise", filename: "tenna_island", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Physical Challenge", filename: "minigame_kart", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Piano that may not be played that well", filename: "kris_piano_lower", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Pushing Buddies", filename: "tvromance", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Query?", filename: "query", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Quiz!", filename: "TV_GAME", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Raft Ride", filename: "ch3_board2", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Raise Up Your Bat", filename: "ch3_karaoke_full", album: "DELTARUNE Chapters 3+4 OST" });
register({
	name: "Ripple",
	filename:
		"statue_level1, statue_chord_basic, statue_level2, statue_level3, statue_level4, sound_battle_bg, statue2_level1, statue2_level2, statue2_level3, statue2_level4, statue2_level5",
	album: "DELTARUNE Chapters 3+4 OST",
});
register({ name: "Ruder Buster", filename: "rudebuster_boss", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Sandy Board", filename: "ch3_board1", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Sound Check", filename: "ch3-practice_song_combined", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "SOUTH OF THE BORDER!!", filename: "ch3_south_of_the_border", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "SPAWN", filename: "titan_spawn", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "SWORD", filename: "board_sword_music", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "The distance between two", filename: "noelle_distant", album: "DELTARUNE Chapters 3+4 OST" });
register({
	name: "The LEGEND...?",
	filename: "legend_altered",
	album: "DELTARUNE Chapters 3+4 OST",
	matches(input, normalized) {
		return equalsNormalized(normalized, this.normalizedName) && input.includes("?");
	},
	responses: {
		thelegend: `"{input}" is a different song.`,
	},
});
register({ name: "The Ol' Jitterbug", filename: "jitterbug", album: "DELTARUNE Chapters 3+4 OST" });
register({
	name: "The place where it rained",
	filename: "rain",
	album: "DELTARUNE Chapters 3+4 OST",
	responses: { itsrainingsomewhereelse: `"{input}"? I think you've got the wrong game.` },
});
register({ name: "The Second Sanctuary", filename: "second_church", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "The Third Sanctuary", filename: "church_zone3", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "TV WORLD", filename: "tv_world", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Vapor Buster", filename: "battle_vapor", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Volume Adjustment", filename: "mike_zone", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Welcome to the Green Room", filename: "greenroom_detune", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "Wise words", filename: "gerson_defeated", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "With Hope Crossed On Our Hearts", filename: "quiet_church", album: "DELTARUNE Chapters 3+4 OST" });
register({ name: "4rd Sanctuary", filename: "4rd_sanctuary", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Beautiful Bathtime", filename: "snd_flowery_bromide_f", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Bratfession...?", filename: "bratty_confession", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Catfession...?", filename: "catti_confession", album: "DELTARUNE Chapter 5 OST" });
register({
	name: "Chapter 5 Logo",
	filename: "deltarune_logo_ch5_itoki",
	album: "DELTARUNE Chapter 5 OST",
	responses: { deltarune: `Wow, you hear "DELTARUNE" and think "oh it's gotta be called DELTARUNE"?? Wrong, wrong, WRONG!` },
});
register({ name: "Cutie Mew Mew Magic", filename: "pink", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Dreamwatchers", filename: "flowery_iog_extended", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Festival", filename: "festival", album: "DELTARUNE Chapter 5 OST" });
register({
	name: "Field of Hopes and Dreams (Credits Version)",
	filename: "ch5_credits",
	album: "DELTARUNE Chapter 5 OST",
	matches(input, normalized) {
		return includesNormalized(normalized, this.name) && input.toLowerCase().includes("credits");
	},
	responses: { fieldofhopesanddreams: `"{input}" is incorrect. Be more specific.` },
});
register({ name: "Flower Castle", filename: "flower_castle", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Flower Foyer", filename: "castle_foyer", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Flower King", filename: "asgore_serious", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Flower Man", filename: "Flowerman_Arrangement", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Flying Feather", filename: "cliff_jump_ambience", album: "DELTARUNE Chapter 5 OST" });
register({
	name: "Garden of Hopes and Dreams",
	filename: "field_of_hopes_insaneintherain_intro, field_of_hopes_insaneintherain_loop",
	album: "DELTARUNE Chapter 5 OST",
});
register({ name: "Goodnight, Sweet Prince", filename: "snd_flowery_bromide_r", album: "DELTARUNE Chapter 5 OST" });
register({ name: "I guess I'm in love", filename: "festival_after", album: "DELTARUNE Chapter 5 OST" });
register({ name: "I'm Telling!", filename: "meeting_flower_orange", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Inappropriate Recycling", filename: "inappropriate_recycling", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Loving Steps", filename: "blue_flower", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Onsen", filename: "running_water", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Petal Dance", filename: "miniboss_new_section_idea_wip", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Pink", filename: "pink_theme", album: "DELTARUNE Chapter 5 OST" });
register({
	name: "Pirate Dojo",
	filename: "pirate_zone",
	album: "DELTARUNE Chapter 5 OST",
	messageFor: (input, normalized) =>
		normalized.includes("gaster") ? `"${input}" is INCORRECT! NOT EVERYTHING IS GASTER!!!!!` : `"${input}" is incorrect.`,
});
register({ name: "Quiet Glade", filename: "piano_ambience", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Rakuichi Buster", filename: "rakuichi_buster_wip", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Ride the Board", filename: "flowery_skateboard", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Running Sky", filename: "castle_top", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Shop 3", filename: "shop_3", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Stop, Criminell!", filename: "meeting_flower_cowboy", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Sunset of Seven Suns", filename: "cliff", album: "DELTARUNE Chapter 5 OST" });
register({ name: "That Day", filename: "asgore_conspiracy", album: "DELTARUNE Chapter 5 OST" });
register({ name: "The Diner Song of Best Friends", filename: "flowery_diner_romantic", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Thousand Cafe Zukan", filename: "flower_cafe", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Violet Tactics", filename: "castle_loop", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Walking Home", filename: "festival_night", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Weak Flowers", filename: "flowery_sad", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Weirder Birds", filename: "birds_ch5", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Who might you be?", filename: "meeting_flower", album: "DELTARUNE Chapter 5 OST" });
register({ name: "Your Dad's Best Friend", filename: "flowery", album: "DELTARUNE Chapter 5 OST" });
