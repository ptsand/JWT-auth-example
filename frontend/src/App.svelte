<script>
	import { Router, Link, Route, navigate } from "svelte-navigator";
  import Home from "./pages/Home/Home.svelte";
  import Register from "./pages/Register/Register.svelte";
  import Login from "./pages/Login/Login.svelte";
  import { user } from "./store/globals.js";
  import makeReq from "./utils/fetchWrapper.js";
  import Profile from "./pages/Profile/Profile.svelte";

  const logoutHandler = ()=>{
    sessionStorage.clear(); // delete tokens
    $user=null;
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
          <li class="nav-item">
            <Link class="nav-link" to="/login">Login</Link>
          </li>
          {:else}
          <li class="nav-item">
            <Link class="nav-link" to="/profile">Profile</Link>
          </li>
          <li class="nav-item">
            <button class="nav-link" on:click="{logoutHandler}">Logout</button>
          </li>
          {/if}
        </ul>
      </div>
    </div>
  </nav>

  <main>
      <Route path="/"><Home /></Route>
      <Route path="/register"><Register /></Route>
      <Route path="/login"><Login /></Route>
      <Route path="/profile"><Profile /></Route>
  </main>
</Router>