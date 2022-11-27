<script>
    import makeReq from '../../utils/fetchWrapper.js';
    import { useParams } from "svelte-navigator";
    import { user } from "../../store/globals.js";
    import { onMount } from 'svelte';
    
    export let registerFocus;

    let status;
    let error;

    const params = useParams();

    onMount(async ()=>{
        status = "confirming your email..."
        try {
            await makeReq(`/users/confirm-email/${$params.code}`).then((res)=>status=res.message);
            $user.email_confirmed = 1;
        } catch (err) {
            error = true;
            status = err.message;
        }
    });
</script>

<div use:registerFocus class="alert alert-{error ? 'warning' : 'success'} w-100">
    { status }
</div>