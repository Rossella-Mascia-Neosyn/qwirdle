import { $, component$, useStore, useStyles$ } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';
import cssStyle from './index.css?inline';

export default component$(() => {
	useStyles$(cssStyle);
	const store = useStore({
		guesses: ['abbey', '', '', '', '', ''],
		answers: ['c____'],
		answer: null,
		i: 1,
		classnames: {} as Record<string, string>,
		won: false,
	});
	const form = { badGuess: false };

	const onKeyPress = $((key: string) => {
		if (!!key) {
			const guesses = store.guesses;
			let guess = guesses[store.i];

			if (key === 'enter') {
				console.log('enter');
			} else if (key === 'backspace') {
				guesses[store.i] = guess.slice(0, -1);
				if (form?.badGuess) form.badGuess = false;
			} else if (guess.length < 5) {
				guesses[store.i] += key;
			}
			store.guesses = [...guesses];
		}
	});

	return (
		<form method='POST' action='?/enter'>
			{JSON.stringify(store)}
			<div
				class={`grid ${!store.won ? 'playing' : ''} ${
					form?.badGuess ? 'bad-guess' : ''
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
												class={store.classnames[letter]}
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
