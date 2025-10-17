const ArticleController = {
  async initHomeArticles(){
    const list = (await Api.getArticles()).slice(0,3);
    $("#homeArticles").innerHTML = list.map(a=>ArticleController.card(a)).join("");
  },
  async initList(){
    const list = await Api.getArticles();
    $("#articleList").innerHTML = list.map(a=>ArticleController.card(a,true)).join("");
  },
  async initDetail(id){
    const a = await Api.getArticle(id);
    if(!a){ $("#articleDetail").innerHTML = `<div class='alert alert-warning'>Không tìm thấy bài viết.</div>`; return; }
    $("#articleDetail").innerHTML = `
      <h2 class="fw-bold">${helpers.escapeHTML(a.tieu_de)}</h2>
      <div class="text-muted small mb-3"><i class="bi bi-person"></i> ${helpers.escapeHTML(a.tac_gia)} · <i class="bi bi-calendar"></i> ${new Date(a.ngay_dang).toLocaleDateString('vi-VN')}</div>
      <img src="${a.thumb}" class="img-fluid rounded-12 mb-3" alt="Ảnh minh họa">
      <div class="lh-lg">${a.noi_dung}</div>
    `;
  },
  async initPricing(){
    const [services, prices, branches] = [await Api.getServices(), await Api.getPrices(), await Api.getBranches()];
    const map = new Map(prices.map(p=>[`${p.ma_chi_nhanh}-${p.ma_dich_vu}`, p.don_gia]));
    $("#pricingTable").innerHTML = `
      <thead><tr><th>Dịch vụ</th>${branches.map(b=>`<th>${helpers.escapeHTML(b.ten_chi_nhanh)}</th>`).join("")}</tr></thead>
      <tbody>
        ${services.map(s=>`
          <tr><td>${helpers.escapeHTML(s.ten_dich_vu)}</td>
            ${branches.map(b=>`<td>${helpers.money(map.get(`${b.ma_chi_nhanh}-${s.ma_dich_vu}`)||s.gia_goi_y)}</td>`).join("")}
          </tr>
        `).join("")}
      </tbody>
    `;
  },
  initPrivacy(){
    // nothing extra for now
  },
  card(a, showBtn=false){
    return `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100">
          <img src="${a.thumb}" class="card-img-top rounded-12" alt="${helpers.escapeHTML(a.tieu_de)}">
          <div class="card-body">
            <h5 class="card-title">${helpers.escapeHTML(a.tieu_de)}</h5>
            <p class="card-text text-muted small">${helpers.escapeHTML(a.tom_tat)}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-muted small"><i class="bi bi-person"></i> ${helpers.escapeHTML(a.tac_gia)}</span>
              <span class="text-muted small"><i class="bi bi-calendar"></i> ${new Date(a.ngay_dang).toLocaleDateString('vi-VN')}</span>
            </div>
            ${showBtn?`<a class="btn btn-sm btn-outline-primary mt-2" href="#/article/${a.ma_bai_viet}">Đọc tiếp</a>`:""}
          </div>
        </div>
      </div>
    `;
  }
};
