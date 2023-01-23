import {
	$,
	component$,
	useOnWindow,
	useStore,
	useStyles$,
	useTask$,
} from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';
import { Keyboard } from '~/components/keyboard/Keyboard';
import { Results } from '~/components/results/Results';
import { allowed, words } from '~/data/words.server';
import cssStyle from './index.css?inline';

type Store = {
	guesses: string[];
	answers: string[];
	answer: string;
	i: number;
	won: boolean;
	badGuess: boolean;
	classnames: Record<string, string>;
};

export default component$(() => {
	useStyles$(cssStyle);
	const store = useStore<Store>({
		guesses: ['', '', '', '', '', ''],
		answers: [],
		answer: words[Math.floor(Math.random() * words.length)],
		i: 0,
		won: false,
		badGuess: false,
		classnames: {},
	});

	useTask$(({ track }) => {
		track(() => store.answers);
		store.classnames = {};

		store.answers.forEach((answer, i) => {
			const guess = store.guesses[i];

			for (let i = 0; i < 5; i += 1) {
				const letter = guess[i];

				if (answer[i] === 'x') {
					store.classnames[letter] = 'exact';
				} else if (!store.classnames[letter]) {
					store.classnames[letter] = answer[i] === 'c' ? 'close' : 'missing';
				}
			}
		});
	});

	const check = $(() => {
		const word = store.guesses[store.i];
		const valid = allowed.has(word);
		if (!valid) return true;

		const available = Array.from(store.answer);
		const answer = Array(5).fill('_');

		// first, find exact matches
		for (let i = 0; i < 5; i += 1) {
			if (word[i] === available[i]) {
				answer[i] = 'x';
				available[i] = ' ';
			}
		}

		// then find close matches (this has to happen
		// in a second step, otherwise an early close
		// match can prevent a later exact match)
		for (let i = 0; i < 5; i += 1) {
			if (answer[i] === '_') {
				const index = available.indexOf(word[i]);
				if (index !== -1) {
					answer[i] = 'c';
					available[index] = ' ';
				}
			}
		}

		store.answers = [...store.answers, answer.join('')];
		if (answer.join('') === 'xxxxx') {
			store.won = true;
		} else {
			store.i += 1;
		}
		return false;
	});

	const onKeyPress = $(async (key: string) => {
		if (!store.won && store.i < 6 && key) {
			const guesses = store.guesses;
			const guess = guesses[store.i];
			if (key === 'Enter') {
				store.badGuess = await check();
				setTimeout(() => (store.badGuess = false), 1000);
			} else if (key === 'Backspace') {
				guesses[store.i] = guess.slice(0, -1);
				if (store.badGuess) store.badGuess = false;
			} else if (guess.length < 5) {
				guesses[store.i] += key;
			}
			store.guesses = [...guesses];
		}
	});

	useOnWindow(
		'keydown',
		$((event: Event) => {
			if (event instanceof KeyboardEvent) {
				if (event.metaKey) return;
				onKeyPress(event.key);
			}
		})
	);

	const getAnswerClass = (answer: string) =>
		answer === 'x'
			? 'exact'
			: answer === 'c'
			? 'close'
			: answer === '_'
			? 'missing'
			: '';

	return (
		<form method='GET' action=''>
			<div
				class={`grid ${!store.won ? 'playing' : ''} ${
					store.badGuess ? 'bad-guess' : ''
				}`}
			>
				{[...Array(6).keys()].map((row) => {
					const current = row === store.i;
					return (
						<div class={`row ${row === store.i ? 'current' : ''}`}>
							{[...Array(5).keys()].map((col) => {
								const answer = store.answers[row]?.[col];
								const value = store.guesses[row]?.[col] ?? '';
								const selected = current && col === store.guesses[row].length;
								return (
									<div
										class={`letter ${getAnswerClass(answer)} ${
											selected ? 'selected' : ''
										}`}
									>
										{value}
										<input
											name='guess'
											disabled={!current}
											type='hidden'
											value={value}
										/>
									</div>
								);
							})}
						</div>
					);
				})}
			</div>
			<div class='controls'>
				{store.won || store.answers.length >= 6 ? (
					<Results won={store.won} answer={store.answer} />
				) : (
					<Keyboard
						onKeyPress={onKeyPress}
						classnames={store.classnames}
						submittable={store.guesses[store.i]?.length === 5}
					/>
				)}
			</div>
		</form>
	);
});

export const head: DocumentHead = {
	title: 'Qwirdle',
	meta: [
		{
			name: 'description',
			content: 'Qwirdle is a clone of Wordle with Qwik',
		},
	],
};
