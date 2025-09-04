class SoundcloudEmbed extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const trackId = this.getAttribute("track-id");
    if (!trackId) return;

    this.innerHTML = `<embed-container height="166px">
      <iframe
        class="absolute top-0 left-0 w-full h-full"
        src="https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/${trackId}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
        frameborder="0"
        allow="autoplay"
      ></iframe>
    </embed-container>`;
  }
}

customElements.define("soundcloud-embed", SoundcloudEmbed);
