<nav class="navbar" aria-label="main navigation">
    <div class="navbar-brand">
        <a class="navbar-item" href="/">
            Place-Mark
        </a>

        <a role="button" class="navbar-burger" href="/" aria-label="menu" aria-expanded="false" data-target="main-nav">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
        </a>
    </div>

    <div class="navbar-menu" id="main-nav">
        <div class="navbar-start">
            <a class="navbar-item" href="/">
                Home
            </a>
        </div>
        <div class="navbar-end">
            <div class="navbar-item">
                <div class="buttons">
                    <a class="button is-primary" href="/sign-in" data-sveltekit-preload-data="off">
                        <strong>Sign In</strong>
                    </a>
                    <a class="button is-secondary" href="/">
                        <strong>Logout</strong>
                    </a>
                </div>
            </div>
        </div>
    </div>
</nav>