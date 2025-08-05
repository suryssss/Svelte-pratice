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
		margin-left: 100px;
		margin-right: 20px;
        margin-top: 20px;
        margin-bottom: 20px;
		justify-content: space-between;
		align-items: center;
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
		height: 50px; 
	}
</style>
