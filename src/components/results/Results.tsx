import { component$ } from '@builder.io/qwik';

type Props = {
	won: boolean;
	answer: string;
};

export const Results = component$<Props>(({ won, answer }) => (
	<>
		{!won && answer && <p>the answer was "{answer}"</p>}
		<button data-key='enter' class='restart selected'>
			{won ? 'you won :)' : `game over :(`} play again?
		</button>
	</>
));
