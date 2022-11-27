<script>
    import { user } from '../../store/globals.js';
    import makeReq from '../../utils/fetchWrapper.js';
    import { pp } from '../../store/globals.js';
    export let registerFocus;
</script>

<div use:registerFocus class="alert alert-success w-100">
        {$user.username}, you have {$user.role.toUpperCase()} priveleges
        {#await makeReq("/users/me")}
            fetching your information...
        {:then details}
            under construction, 
            fetched user json:
            <pre><code>{pp(details)}</code></pre>
        {:catch err}
            {err}
        {/await}
</div>