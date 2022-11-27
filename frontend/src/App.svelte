<script>
  import { Router, Link, Route, navigate } from "svelte-navigator";
  import PrivateRoute from "./components/PrivateRoute/PrivateRoute.svelte";
  import Home from "./pages/Home/Home.svelte";
  import Register from "./pages/Register/Register.svelte";
  import Login from "./pages/Login/Login.svelte";
  import { user } from "./store/globals.js";
  import Profile from "./pages/Profile/Profile.svelte";
  import ConfirmEmail from "./pages/Profile/ConfirmEmail.svelte";

  
  const logoutHandler = ()=>{
    // delete tokens and navigate home
    $user = null;
    navigate('/');
  }
</script>

<Router>
  <nav class="navbar navbar-expand-md bg-light mb-2">
    <div class="container-fluid">
      <Link class="navbar-brand" to="/">JWT AUTH</Link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <Link class="nav-link active" to="/">Home</Link>
          </li>
          {#if !$user}
          <li class="nav-item">
            <Link class="nav-link" to="/register">Register</Link>
          </li>
          {:else}
          <li class="nav-item">
            <Link class="nav-link" to="/profile">Profile</Link>
          </li>
          <li class="nav-item">
            <button class="nav-link btn btn-link" on:click="{logoutHandler}">Logout</button>
          </li>
          {/if}
        </ul>
      </div>
    </div>
  </nav>
  <main>
    <PrivateRoute path="/" let:location let:registerFocus>
      <Home {registerFocus} />
    </PrivateRoute>
    <Route path="/register"><Register /></Route>
    <Route path="/login"><Login /></Route>
    <PrivateRoute path="/profile" let:location let:registerFocus>
      <Profile {registerFocus} />
    </PrivateRoute>
    <PrivateRoute path="/profile/confirm-email/:code" let:location let:registerFocus>
      <ConfirmEmail {registerFocus} />
    </PrivateRoute>
  </main>
</Router>