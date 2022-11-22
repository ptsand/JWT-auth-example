<script>
    import { user } from '../../store/globals.js';
    import makeReq from '../../utils/fetchWrapper.js';
</script>

<div class="alert alert-success text-center w-100">
    {#if $user.name}
        Welcome {$user.name}, you have {$user.role.toUpperCase()} priveleges
        {#await makeReq("/users/me")}
            fetching...
        {:then details} 
            {JSON.stringify(details)}
        {:catch err}
            {err}
        {/await}
    {:else}
        Please sign up and authenticate to access protected ressources
    {/if}
</div>