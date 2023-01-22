import {
	$,
	component$,
	useOnWindow,
	useStore,
	useStyles$,
} from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';
import { allowed, words } from '~/data/words.server';
import cssStyle from './index.css?inline';

type Store = {
	guesses: string[];
	answers: string[];
	answer: string;
	i: number;
	won: boolean;
	badGuess: boolean;
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
	});

	const check = $(() => {
		const word = store.guesses[store.i];
		const valid = allowed.has(word);
		console.log('1');
		if (!valid) return true;

		console.log('2');

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
			console.log('0', key);
			if (key === 'Enter') {
				console.log('0');
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

	return (
		<form method='POST' action='?/enter'>
			{JSON.stringify(store)}
			<div
				class={`grid ${!store.won ? 'playing' : ''} ${
					store.badGuess ? 'bad-guess' : ''
				}`}
			>
				{[...Array(6).keys()].map((row) => {
					return (
						<>
							<h2 class='visually-hidden'>{row + 1}</h2>
							<div class={`row ${row === store.i ? 'current' : ''}`}>
								{[...Array(5).keys()].map((column) => {
									return (
										<div
											class={`letter ${
												store.answers[row]?.[column] === 'x' ? 'exact ' : ''
											} ${
												store.answers[row]?.[column] === 'c' ? 'close ' : ''
											} ${
												store.answers[row]?.[column] === '_' ? 'missing ' : ''
											} ${
												row === store.i && column === store.guesses[row].length
													? 'selected'
													: ''
											}`}
										>
											{store.guesses[row]?.[column] ?? ''}
											<span class='visually-hidden'>
												{store.answers[row]?.[column] === 'x' ? (
													<>(correct)</>
												) : store.answers[row]?.[column] === 'c' ? (
													<>(present)</>
												) : store.answers[row]?.[column] === '_' ? (
													<>(absent)</>
												) : (
													<>empty</>
												)}
											</span>
											<input
												name='guess'
												disabled={row !== store.i}
												type='hidden'
												value={store.guesses[row]?.[column] ?? ''}
											/>
										</div>
									);
								})}
							</div>
						</>
					);
				})}
			</div>
			<div class='controls'>
				{store.won || store.answers.length >= 6 ? (
					<>
						{!store.won && store.answer && (
							<p>the answer was "{store.answer}"</p>
						)}
						<button data-key='enter' class='restart selected'>
							{store.won ? 'you won :)' : `game over :(`} play again?
						</button>
					</>
				) : (
					<div class='keyboard'>
						<button
							preventdefault:click
							onClick$={$(() => {
								onKeyPress('enter');
							})}
							data-key='enter'
							class={`${
								store.guesses[store.i]?.length === 5 ? 'selected' : ''
							}`}
							disabled={store.guesses[store.i]?.length !== 5}
						>
							enter
						</button>

						<button
							preventdefault:click
							onClick$={$(() => {
								onKeyPress('backspace');
							})}
							data-key='backspace'
							name='key'
							value='backspace'
						>
							back
						</button>

						{['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map((row) => {
							return (
								<div class='row'>
									{[...row].map((letter) => {
										return (
											<button
												preventdefault:click
												onClick$={$(() => {
													onKeyPress(letter);
												})}
												data-key={letter}
												class={`${
													store.answer[store.i] === 'x'
														? 'exact'
														: store.answer[store.i] === 'c'
														? 'close'
														: 'missing'
												}`}
												disabled={store.guesses[store.i].length === 5}
												name='key'
												value={letter}
											>
												{letter}
											</button>
										);
									})}
								</div>
							);
						})}
					</div>
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
