import { CURRENCY } from "@/lib/envSecret";
import { IOrder } from "@/redux/service/orders/type";
import { format } from "date-fns";

const formatCurrency = (amount: number = 0) => `${CURRENCY} ${amount.toFixed(2)}`;

export const formateDownloadInvoice = async (order: IOrder) => {
  const jsPDF = (await import("jspdf")).default;
  const html2canvas = (await import("html2canvas")).default;

  const invoiceElement = document.createElement("div");
  const shipping = order?.shippingAddress;
  const items = order?.items || [];
  const pricing = order?.pricing;

  const orderDate = order?.createdAt
    ? format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")
    : format(new Date(), "dd MMM yyyy");

  invoiceElement.innerHTML = `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: #ffffff;
      color: #1e293b;
      line-height: 1.5;
      box-sizing: border-box;
    ">
      <!-- Header -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 24px;
        margin-bottom: 28px;
      ">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="
              width: 38px;
              height: 38px;
              background: #f97316;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 800;
              font-size: 20px;
            ">H</div>
            <h1 style="
              font-size: 24px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
              letter-spacing: -0.5px;
            ">Herbalife BD</h1>
          </div>
          <p style="color: #64748b; font-size: 13px; margin: 6px 0 0 0;">
            Premium Health, Nutrition & Wellness Products
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin: 2px 0 0 0;">
            Dhaka, Bangladesh • Hotline: +880 1728-068200
          </p>
        </div>

        <div style="text-align: right;">
          <span style="
            display: inline-block;
            background: #fff7ed;
            color: #ea580c;
            border: 1px solid #ffedd5;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          ">INVOICE</span>
          <h2 style="
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
            text-transform: uppercase;
          ">#${order?.invoiceNumber || "N/A"}</h2>
          <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">
            Date: <strong>${orderDate}</strong>
          </p>
        </div>
      </div>

      <!-- Info Columns -->
      <div style="
        display: flex;
        justify-content: space-between;
        gap: 24px;
        margin-bottom: 28px;
      ">
        <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
          <h3 style="
            color: #475569;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 8px 0;
          ">Customer / Ship To</h3>
          <p style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">
            ${shipping?.fullName || "Valued Customer"}
          </p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #334155;">
            <strong>Phone:</strong> ${shipping?.phone || "N/A"}
          </p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #334155; line-height: 1.4;">
            <strong>Address:</strong> ${shipping?.address || "N/A"}
            ${shipping?.postalCode ? ` (${shipping.postalCode})` : ""}
          </p>
        </div>

        <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
          <h3 style="
            color: #475569;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 8px 0;
          ">Order Summary</h3>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
            <span style="color: #64748b;">Order Status:</span>
            <span style="font-weight: 700; color: #0f172a; text-transform: uppercase;">
              ${order?.orderStatus || "PENDING"}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
            <span style="color: #64748b;">Payment Method:</span>
            <span style="font-weight: 700; color: #0f172a; text-transform: uppercase;">
              ${order?.payment?.method || "COD"}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span style="color: #64748b;">Payment Status:</span>
            <span style="
              font-weight: 700;
              color: ${order?.payment?.status === "PAID" ? "#16a34a" : "#ea580c"};
              text-transform: uppercase;
            ">
              ${order?.payment?.status || "PENDING"}
            </span>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div style="margin-bottom: 28px;">
        <table style="
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        ">
          <thead>
            <tr style="background: #f1f5f9; color: #334155; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0;">Item</th>
              <th style="padding: 12px 16px; text-align: right; border-bottom: 1px solid #e2e8f0;">Unit Price</th>
              <th style="padding: 12px 16px; text-align: center; border-bottom: 1px solid #e2e8f0;">Qty</th>
              <th style="padding: 12px 16px; text-align: right; border-bottom: 1px solid #e2e8f0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item, index) => `
              <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px; background: ${index % 2 === 0 ? "#ffffff" : "#f8fafc"};">
                <td style="padding: 12px 16px;">
                  <div style="font-weight: 600; color: #0f172a;">${item.productName}</div>
                  ${
                    item.sku
                      ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">SKU: ${item.sku}</div>`
                      : ""
                  }
                  ${
                    item.selectedVariants && Object.keys(item.selectedVariants).length > 0
                      ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${Object.entries(
                          item.selectedVariants
                        )
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" • ")}</div>`
                      : ""
                  }
                </td>
                <td style="padding: 12px 16px; text-align: right; color: #334155;">
                  ${formatCurrency(item.salePrice || item.price)}
                </td>
                <td style="padding: 12px 16px; text-align: center; font-weight: 600; color: #0f172a;">
                  ${item.quantity}
                </td>
                <td style="padding: 12px 16px; text-align: right; font-weight: 700; color: #0f172a;">
                  ${formatCurrency((item.salePrice || item.price) * item.quantity)}
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <!-- Financial Totals -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 28px;">
        <div style="
          width: 320px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
        ">
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #475569;">
            <span>Subtotal:</span>
            <span style="font-weight: 600; color: #0f172a;">${formatCurrency(pricing?.subtotal || 0)}</span>
          </div>

          ${
            pricing?.shippingCharge
              ? `
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #475569;">
            <span>Shipping:</span>
            <span style="font-weight: 600; color: #0f172a;">${formatCurrency(pricing.shippingCharge)}</span>
          </div>
          `
              : ""
          }

          ${
            pricing?.tax && pricing.tax > 0
              ? `
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #475569;">
            <span>Tax:</span>
            <span style="font-weight: 600; color: #0f172a;">${formatCurrency(pricing.tax)}</span>
          </div>
          `
              : ""
          }

          ${
            pricing?.discount && pricing.discount > 0
              ? `
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #16a34a;">
            <span>Discount (${order?.coupon?.code || "Coupon"}):</span>
            <span style="font-weight: 600;">-${formatCurrency(pricing.discount)}</span>
          </div>
          `
              : ""
          }

          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 2px solid #e2e8f0;
            padding-top: 10px;
            margin-top: 8px;
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
          ">
            <span>Total Payable:</span>
            <span style="color: #ea580c;">${formatCurrency(pricing?.total || 0)}</span>
          </div>
        </div>
      </div>

      <!-- Customer Note if present -->
      ${
        order?.customerNote
          ? `
      <div style="
        background: #f1f5f9;
        border-left: 4px solid #f97316;
        padding: 12px 16px;
        border-radius: 4px;
        font-size: 12px;
        color: #334155;
        margin-bottom: 24px;
      ">
        <strong>Customer Note:</strong> ${order.customerNote}
      </div>
      `
          : ""
      }

      <!-- Footer -->
      <div style="
        border-top: 1px solid #e2e8f0;
        padding-top: 20px;
        text-align: center;
        color: #94a3b8;
        font-size: 12px;
      ">
        <p style="margin: 0; font-weight: 600; color: #475569;">
          Thank you for ordering with Herbalife BD!
        </p>
        <p style="margin: 4px 0 0 0;">
          For support or order inquiries, WhatsApp us at <strong>+880 1728-068200</strong> or visit <strong>herbalifebd.com</strong>
        </p>
      </div>
    </div>
  `;

  invoiceElement.style.position = "absolute";
  invoiceElement.style.left = "-9999px";
  invoiceElement.style.top = "0";
  document.body.appendChild(invoiceElement);

  try {
    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: 800,
      height: invoiceElement.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`HerbalifeBD-Invoice-${order?.invoiceNumber || "order"}.pdf`);
  } finally {
    if (document.body.contains(invoiceElement)) {
      document.body.removeChild(invoiceElement);
    }
  }
};
