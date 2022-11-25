<script>
    // @ts-nocheck
    import { Sveltik, Form, Field, ErrorMessage } from 'sveltik';
    import { useFocus } from "svelte-navigator";
    import { onMount } from 'svelte';
    import makeReq from '../../utils/fetchWrapper.js';

	const registerFocus = useFocus();
    onMount(()=>registerFocus(document.getElementById("username")));
    
    let status = { err: false, msg: undefined };

    let initialValues = {
        username: 'user',
        email: 'test@dev.mail',
        password: 'letmein',
    };
    
    let validate = values => {
        const errors = {};
        if (!values.username) {
            errors.username = 'Required';
        } else if (!values.password) {
            errors.password = 'Required';
        } else if (!values.email) {
            errors.email = 'Required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
            errors.email = 'Invalid email address';
        }
        return errors;
    }
    
    let onSubmit = async (user, { setSubmitting }) => {
        try {
            status.msg = await makeReq("/users", "post", user).then(res=>res.message);
        } catch (err) {
            status.err = true;
            status.msg = err.message;
        }
        setSubmitting(false);
    }
</script>

<div class="d-flex w-100">
    <Sveltik {initialValues} {validate} {onSubmit} let:isSubmitting>
        <Form class="bg-light px-4 py-2 mx-auto text-center border" style="min-width: 30vw;">
            <h3 class="mb-3">Sign up</h3>
            <div class="form-floating mb-3">
                <Field class="form-control" id="username" type="text" name="username" />
                <label for="username">Username</label>
                <ErrorMessage name="username" as="div" />
            </div>
            <div class="form-floating mb-3">
                <Field class="form-control" id="password" type="password" name="password" />
                <label for="password">Password</label>
            </div>
            <div class="form-floating mb-3">
                <Field class="form-control" id="email" type="email" name="email" />
                <label for="email">Email</label>
                <ErrorMessage name="email" as="div" />
            </div>
            <div>
                <button class="btn btn-primary mb-2" type="submit" disabled={isSubmitting}>Submit</button>
                {#if isSubmitting}
                    <div>In progress...</div>
                {:else if status.msg}
                    <div class="alert mb-0 alert-{!status.err ? 'success' : 'danger'}">
                        {status.msg}
                    </div>
                {/if}
            </div>
        </Form>
    </Sveltik>
</div>