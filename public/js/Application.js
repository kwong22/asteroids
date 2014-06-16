// Wait until the browser is ready to render the game
window.requestAnimationFrame(function() {
    document.game = new Game();
    document.game.run();
});
