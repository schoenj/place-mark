<script lang="ts">
    // import {apiClient} from "../../api-client";
    // import {goto} from "$app/navigation";

    let email = "";
    let password = "";
    let errorMessages: string[] = [];

    async function login$() {
        // const result =
        //await apiClient.authenticate$({ email, password });
        // if (result.isSuccess) {
        //     console.log(result.data?.token);
        //     await goto("/")
        // } else if (result.isValidationError) {
        //     console.error(result.data);
        // }
    }
</script>

<section class="section">
    <form on:submit|preventDefault={login$}>
        <div class="columns">
            <div class="column">
                <div class="field">
                    <label class="label" for="email">Email</label>
                    <input bind:value={email} class="input" type="text" placeholder="cookie.monster@sesame-street.com" name="email" id="email">
                </div>
            </div>
        </div>
        <div class="columns">
            <div class="column">
                <div class="field">
                    <label class="label" for="password">Password</label>
                    <input bind:value={password} class="input" type="password" placeholder="***" name="password" id="password">
                </div>
            </div>
        </div>
        <div class="columns">
            <div class="column">
                <div class="field">
                    <div class="control">
                        <button class="button">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    </form>

    <!--{errorMessages}-->
    {#if errorMessages}
        <ul>
            {#each errorMessages as errorMessage}
                <li>{errorMessage}</li>
            {/each}
        </ul>
    {/if}
</section>

