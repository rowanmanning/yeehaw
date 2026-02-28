import randomItem from 'random-item';
import adjectives from './sources/adjectives.ts';
import emoji from './sources/emoji.ts';
import nouns from './sources/nouns.ts';

export function randomName() {
	return `${randomItem(adjectives)} ${randomItem(nouns)}`;
}

export function randomEmoji() {
	return randomItem(emoji);
}

export function randomAdjectiveNounName() {
	return adjectives;
}
