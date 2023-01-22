import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { QwikLogo } from '../icons/qwik';
import styles from './header.css?inline';

export default component$(() => {
	useStylesScoped$(styles);

	return (
		<header>
			<span class='title'>Qwirdle is a clone of Wordle with</span>
			<div class='logo'>
				<a href='https://qwik.builder.io/' target='_blank' title='qwik'>
					<QwikLogo />
				</a>
			</div>
		</header>
	);
});
