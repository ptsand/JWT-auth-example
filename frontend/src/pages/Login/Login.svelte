<script>

    import { user } from '../../store/globals.js';
    import { Sveltik, Form, Field, ErrorMessage } from 'sveltik';
    import { useFocus, useNavigate, useLocation } from "svelte-navigator";
    import { onMount } from 'svelte';
    import makeReq from '../../utils/fetchWrapper.js';
    import jwtDecode from 'jwt-decode';

    const navigate = useNavigate();
    const location = useLocation();

	const registerFocus = useFocus();
    onMount(()=>registerFocus(document.getElementById("username")));
    let errorMsg;
    
    let initialValues = {
        username: 'testUser',
        password: 'testPasswordUser'
    };
    
    let validate = values => {
        const errors = {};
        if (!values.username) {
            errors.username = 'Required';
        } else if (!values.password) {
            errors.password = 'Required';
        }
        return errors;
    }

    let onSubmit = async (userCreds, { setSubmitting }) => {
        try {
            const tokens = await makeReq("/auth/login", "post", userCreds);
            const { id, username, role, email_confirmed } = jwtDecode(tokens.access);
            $user = { id, username, role, tokens, email_confirmed };
            console.log("userStore:", $user);
            setSubmitting(false);
            const from = ($location.state && $location.state.from) || "/";
		    navigate(from, { replace: true });
        } catch (err) {
            errorMsg = err.message;
            setSubmitting(false);
        }
    }
</script>

<div class="d-flex w-100">
    <Sveltik {initialValues} {validate} {onSubmit} let:isSubmitting>
        <Form class="bg-light px-4 py-2 mx-auto text-center border" style="min-width: 30vw;">
            <h3 class="mb-3">Login</h3>
            <div class="form-floating mb-3">
                <Field class="form-control" id="username" type="text" name="username" />
                <label for="username">Username</label>
                <ErrorMessage name="username" as="div" />
            </div>
            <div class="form-floating mb-3">
                <Field class="form-control" id="password" type="password" name="password" />
                <label for="password">Password</label>
                <ErrorMessage name="password" as="div" />
            </div>
            <div>
                <button class="btn btn-primary mb-2" type="submit" disabled={isSubmitting}>Submit</button>
                {#if isSubmitting}
                    <div>In progress...</div>
                {:else if errorMsg}
                    <div class="alert mb-0 alert-danger">
                        {errorMsg}
                    </div>
                {/if}
            </div>
        </Form>
    </Sveltik>
</div>