<script lang="ts">
    import Header from "$lib/layout/Header.svelte";
    import Navbar from "$lib/layout/Navbar.svelte";
</script>

<Header>
    <Navbar/>
</Header>

<div class="container">
    <slot></slot>
</div>
