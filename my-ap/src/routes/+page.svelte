<script lang="ts">
    import { onMount } from "svelte";
    import { runCanvas } from "./canvas";

    const log: string[] = $state([]);

    onMount(() => {
        try {
            runCanvas();
        } catch (e) {
            log.push(e?.toString ? e.toString() : JSON.stringify(e));
        }
    });
</script>

<div class="log">
    {#each log as line}
        <li>{line}</li>
    {/each}
</div>

<canvas id="canvas"></canvas>

<style>
    :global {
        * {
            font-family: system-ui, sans-serif;
            padding: 0;
            margin: 0;
            box-sizing: border-box;
            overflow: hidden;
        }
        #canvas {
            width: 100%;
            height: 100%;
        }
        .log {
            position: absolute;
            top: 0rem;
            left: 0rem;
            min-width: 20rem;
            min-height: 10rem;
            max-height: 80%;
            max-width: 80%;
            resize: both;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            overflow-y: auto;

            li {
                list-style: none;
                margin: 1rem;
                font-size: 1.2rem;
            }
        }
    }
</style>