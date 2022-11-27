<script>
    import { user } from '../../store/globals.js';
    import jwtDecode from 'jwt-decode';
    import { pp } from '../../store/globals.js';
    import Toast from "../../components/Toast/Toast.svelte";
    
    export let registerFocus;
    
</script>
<div use:registerFocus class="alert alert-success w-100">
    Welcome {$user.username}, recieved signed tokens from backend:
    <pre class="mb-0"><code>{pp($user.tokens)}</code></pre>
    Access token after base64 decoding is this json:
    <pre><code>{pp(jwtDecode($user.tokens.access))}</code></pre>
</div>

{#if !$user.email_confirmed}
    <Toast title="Confirmation Bot" message="Please confirm your email, thanks" />
{/if}