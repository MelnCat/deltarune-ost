import data from "./motifs.json" with { type: "json" };
import { tracks } from "./ost";

export const motifs = data.bucket
	.map(x => {
		return { track: x.track, major: "major" in x, motif: x.motif === "THE WORLD REVOLVING" ? "FREEDOM" : x.motif };
	})
	.filter(x => tracks.some(y => y.name === x.track))//.filter(x => x.major);
const motifsByTrack = Object.fromEntries(tracks.map(x => [x.name, motifs.filter(y => y.track === x.name).map(y => y.motif)]));
const tracksByMotif = Object.fromEntries(
	[...new Set(motifs.map(x => x.motif))].map(x => [
		x,
		motifs
			.filter(y => y.motif === x)
			.map(y => y.track),
	]),
);
