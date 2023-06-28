<script>
    import Header from '$lib/Header.svelte';
    import Navbar from '$lib/Navbar.svelte';
</script>

<Header>
    <Navbar/>
</Header>

<div class="container">
    <slot></slot>
</div>
