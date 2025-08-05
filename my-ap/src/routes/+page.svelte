<div class="container">
	<header><img src="logo.png" alt="nope" /></header>
	<nav>
		<a href="#">Settings</a>
		<a href="#">Profile</a>
	</nav>
</div>

<style>
	.container {
		display: flex;
		margin-left: 20px;
		margin-right: 20px;
		justify-content: space-between;
		align-items: center;
		margin: 20px;
	}
	nav {
		display: flex;
		gap: 20px;
	}

	nav a {
		text-decoration: none;
		color: #333;
	}

	nav a:hover {
		text-decoration: underline;
	}

	header img {
		height: 50px; /* optional */
	}
</style>
