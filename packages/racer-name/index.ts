import randomItem from 'random-item';
import adjectives from './words/adjectives.ts';
import nouns from './words/nouns.ts';

export function randomName() {
	return `${randomItem(adjectives)} ${randomItem(nouns)}`;
}

export function randomAdjectiveNounName() {
	return adjectives;
}
