import { component$, useStore, useStyles$ } from '@builder.io/qwik';
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
	});
	const won = false;
	const form = { badGuess: false };
	return (
		<form method='POST' action='?/enter'>
			{JSON.stringify(store)}
			<div
				class={`grid ${!won ? 'playing' : ''} ${
					form?.badGuess ? 'bad-guess' : ''
				}`}
			>
				{[...Array(6).keys()].map((row) => {
					return (
						<>
							<h2 class='visually-hidden s-QKuN4MdM35ff'>{row + 1}</h2>
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
				{/* {won || store.answers.length >= 6
			{#if !won && data.answer}
				<p>the answer was "{data.answer}"</p>
			{/if}
			<button data-key="enter" class="restart selected" formaction="?/restart">
				{won ? 'you won :)' : `game over :(`} play again?
			</button>
		{:else} */}
				<div class='keyboard'>
					<button
						data-key='enter'
						class={`${store.guesses[store.i]?.length === 5 ? 'selected' : ''}`}
						disabled={store.guesses[store.i]?.length !== 5}
					>
						enter
					</button>

					<button
						// on:click|preventDefault={update}
						data-key='backspace'
						// formaction="?/update"
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
											// on:click|preventDefault={update}
											data-key={letter}
											class={store.classnames[letter]}
											disabled={store.guesses[store.i].length === 5}
											// formaction="?/update"
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
