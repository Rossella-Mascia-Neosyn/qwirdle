import { $, component$, PropFunction } from '@builder.io/qwik';

type Props = {
	onKeyPress: PropFunction<(key: string) => Promise<void>>;
	classnames: Record<string, string>;
	submittable: boolean;
};

export const Keyboard = component$<Props>(
	({ onKeyPress, classnames, submittable }) => (
		<div class='keyboard'>
			<button
				preventdefault:click
				onClick$={$(() => onKeyPress('enter'))}
				data-key='enter'
				class={`${submittable ? 'selected' : ''}`}
				disabled={!submittable}
			>
				enter
			</button>

			<button
				preventdefault:click
				onClick$={$(() => onKeyPress('backspace'))}
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
									onClick$={$(() => onKeyPress(letter))}
									data-key={letter}
									class={classnames[letter]}
									disabled={submittable}
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
	)
);
