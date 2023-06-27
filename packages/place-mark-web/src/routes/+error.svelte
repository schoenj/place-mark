<script lang="ts">
    import { page } from "$app/stores";
</script>

<div class="section">
    <h1 class="title">Ups, an error occured!</h1>
    <p>{$page?.status} {$page?.error?.message}</p>
</div>