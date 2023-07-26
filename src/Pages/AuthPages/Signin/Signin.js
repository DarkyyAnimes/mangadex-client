import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import styles from '../auth.module.scss';

import Form from '../../../SharedUI/Form/Form';
import Input from '../../../SharedUI/Form/Input';
import Buttons from '../../../SharedUI/Form/Buttons';
import CheckBox from '../../../SharedUI/Form/CheckBox';

import MainContainer from '../../../Layouts/MainContainer/MainContainer';
import { setUser } from '../../../Store/Slices/userSlice';
import Spinner from '../../../SharedUI/LoadComponents/Spiner/Spinner';
import Modal from '../../../Features/Modal/Modal';
import ErrorModal from '../../../Components/Modals/ErrorModal/ErrorModal';
import MangaDexApi from '../../../Services/MangaDexApi';
import { Helmet } from 'react-helmet';

const modalRoot = document.getElementById('modal-root');

const Signin = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const [shouldOpen, setShouldOpen] = useState(false);

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [checkbox, setCheckbox] = useState(false);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [message, setMessage] = useState(true);

	const handleSingup = () => {
		navigate(`/singup`);
	};

	const handleSubmit = () => {
		if (!username || !password || checkbox === false) return false;

		const creds = {
			username: username,
			password: password,
		};

		setLoading(true);

		(async () => {
			const resp = await fetch(
				`${MangaDexApi.CorsProxy}https://api.mangadex.org/auth/login`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(creds),
				}
			).then((data) => data.json());

			if (resp.result === 'ok') {
				const expires = new Date().valueOf() + 15 * 60000;

				const user = {
					username,
					expires,
					sessionToken: resp.token.session,
					refreshToken: resp.token.refresh,
				};

				localStorage.setItem('user', JSON.stringify(user));

				dispatch(setUser(user));
				navigate(`/`);
			} else {
				const message = {
					code: resp.errors[0].status,
					details: resp.errors[0].detail,
				};

				setError(message);
				setShouldOpen(true);

				setTimeout(() => {
					setShouldOpen(false);
				}, 4000);
			}

			setLoading(false);
		})();
	};

	return (
		<>
			<Helmet>
				<meta charSet="utf-8" />
				<title>Sign In</title>
				<meta name="description" content={`MangaDex login`} />
			</Helmet>
			<MainContainer mainClasses={styles.flexcenter} isHeaderBlack>
				<Form type={'Log In'}>
					<Input
						type={'text'}
						id={'username'}
						placeholder={'Username'}
						value={username}
						setValue={setUsername}
					/>
					<Input
						type={'password'}
						id={'password'}
						placeholder={'Password'}
						value={password}
						setValue={setPassword}
					/>
					<span className={styles.spansettings}>Forgot Username/Password</span>
					<CheckBox
						value={'Remember Me'}
						checked={checkbox}
						setChecked={setCheckbox}
					/>
					<Buttons>
						<button onClick={handleSubmit}>
							{loading ? (
								<Spinner
									customStyle={{
										width: '27px',
										height: '27px',
										margin: '0px',
										borderColor: 'white',
									}}
									wrappStyles={{ margin: '0px' }}
								/>
							) : (
								`Log In`
							)}
						</button>
						<button onClick={handleSingup}>Create an Account</button>
					</Buttons>
				</Form>
			</MainContainer>

			{error
				? ReactDOM.createPortal(
						<Modal active={shouldOpen} setActive={setShouldOpen}>
							<ErrorModal error={error} setActive={setShouldOpen} />
						</Modal>,
						modalRoot
				  )
				: null}

			{message
				? ReactDOM.createPortal(
						<Modal active={message} setActive={setMessage}>
							<div style={{ padding: 15, fontSize: '14pt' }}>
								<h1 style={{ marginBottom: 10 }}>Test loggin data:</h1>
								<p>Login: usertest123</p>
								<p>Password: usertest123</p>
							</div>
						</Modal>,
						modalRoot
				  )
				: null}
		</>
	);
};

export default Signin;
