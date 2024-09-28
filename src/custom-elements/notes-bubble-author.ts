const images = {
  chatgpt:
    "https://im.dt.in.th/ipfs/bafybeihu4q3gbfszrvpy5s7pl5h5vxx7r2fs7vnq74b6ch3pl3brtnl5yq/image.webp",
  claude:
    "https://im.dt.in.th/ipfs/bafybeih6ou6xr3sblruheh4343waamftbo4l7rmzvh64jax36wike5tacu/image.webp",
  gemini:
    "https://im.dt.in.th/ipfs/bafybeidzmyxzdilpefpn77hd2smv5kyse3vdbl7soet75vkzodsdr763ua/image.webp",
};

class NotesBubbleAuthor extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const author = this.getAttribute("author") || "";
    if (author.startsWith("Claude")) {
      this.showImage(images.claude);
    } else if (author.startsWith("ChatGPT") || author.startsWith("GPT-")) {
      this.showImage(images.chatgpt);
    } else if (author.startsWith("Gemini")) {
      this.showImage(images.gemini);
    }
  }

  showImage(src: string) {
    this.innerHTML = `<img src="${src}" class="not-prose absolute top-0 left-0 w-full h-full object-cover" alt="">`;
    const img = this.querySelector("img");
    if (img) {
      img.alt = this.getAttribute("author") || "";
    }
  }
}

customElements.define("notes-bubble-author", NotesBubbleAuthor);
