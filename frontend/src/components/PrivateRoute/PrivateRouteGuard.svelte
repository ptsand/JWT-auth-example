<script>
	import { useNavigate, useLocation, useFocus } from "svelte-navigator";
	import { user } from "../../store/globals.js";
    import { tokenExpired } from "../../utils/tokenUtil.js";

	const navigate = useNavigate();
	const location = useLocation();
	const registerFocus = useFocus();

	const navigateToLogin = () => {
		navigate("/login", {
			state: { from: $location.pathname },
			replace: true,
		});
	};

	$: if (tokenExpired($user?.tokens?.refresh)) {
		$user = null;
		navigateToLogin();
	}
</script>

{#if !tokenExpired($user?.tokens?.refresh)}
	<slot {registerFocus} />
{/if}
