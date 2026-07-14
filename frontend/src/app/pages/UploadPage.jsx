import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Upload, X, Check, FileText, MapPin, AlertCircle, Archive } from "lucide-react";
import { FormField } from "../components/ui/FormField.jsx";
import { SelectField } from "../components/ui/SelectField.jsx";
import { authFetch, parseErrorMessage } from "../utils/helpers.js";

const emptyUploadFormData = {
  nomorSurat: "",
  tanggal: "",
  perihal: "",
  jenis: "",
  kategori: "",
  prioritas: "",
  lemari: "",
  rak: "",
  ordner: "",
  keterangan: "",
};

export default function UploadPage() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStep, setUploadStep] = useState(0);
  const [formData, setFormData] = useState(emptyUploadFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const update = (k, v) => setFormData({ ...formData, [k]: v });

  const handleSubmit = async () => {
    if (!uploadedFile) {
      toast.error("Unggah berkas PDF terlebih dahulu.");
      return;
    }
    if (!formData.nomorSurat || !formData.tanggal || !formData.perihal || !formData.kategori) {
      toast.error("Lengkapi field metadata dokumen yang wajib diisi.");
      return;
    }
    if (!formData.lemari || !formData.rak || !formData.ordner) {
      toast.error("Lengkapi field lokasi penyimpanan fisik yang wajib diisi.");
      return;
    }

    const storageLocation = [
      formData.lemari,
      formData.rak,
      `Ordner: ${formData.ordner}`,
      formData.keterangan,
    ].filter(Boolean).join(", ");

    const body = new FormData();
    body.append("file", uploadedFile);
    body.append("nomorSurat", formData.nomorSurat);
    body.append("perihal", formData.perihal);
    body.append("kategori", formData.kategori);
    body.append("tanggalSurat", formData.tanggal);
    body.append("storageLocation", storageLocation);

    setIsSubmitting(true);
    try {
      const response = await authFetch("/arsip", { method: "POST", body });
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response, "Gagal mengunggah dokumen."));
      }
      toast.success("Arsip berhasil diunggah dan tersimpan.");
      setFormData(emptyUploadFormData);
      setUploadedFile(null);
      setUploadStep(0);
      navigate("/arsip");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-7 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#0f1c2e]">Upload Arsip Baru</h2>
        <p className="text-slate-500 text-sm mt-0.5">Unggah berkas dan lengkapi metadata untuk pengarsipan dokumen</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-7">
        {["Upload Berkas", "Isi Metadata", "Lokasi Fisik", "Konfirmasi"].map((label, i) => (
          <div key={i} className="flex items-center">
            <button
              onClick={() => setUploadStep(i)}
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                i < uploadStep ? "bg-emerald-500 text-white" :
                i === uploadStep ? "bg-[#1a56db] text-white shadow-lg shadow-blue-200" :
                "bg-slate-200 text-slate-400"
              }`}>
                {i < uploadStep ? <Check style={{ width: 10, height: 10 }} /> : i + 1}
              </div>
              <span className={i === uploadStep ? "text-[#1a56db]" : i < uploadStep ? "text-emerald-600" : "text-slate-400"}>
                {label}
              </span>
            </button>
            {i < 3 && <div className={`w-12 h-px mx-2 ${i < uploadStep ? "bg-emerald-300" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (!file) return;
            if (file.type !== "application/pdf") {
              toast.error("Hanya file PDF yang diperbolehkan.");
              return;
            }
            if (file.size > 25 * 1024 * 1024) {
              toast.error("Ukuran file maksimal 25 MB.");
              return;
            }
            setUploadedFile(file);
            setUploadStep(1);
          }}
          className={`rounded-xl border-2 border-dashed transition-all cursor-pointer py-10 flex flex-col items-center justify-center text-center ${
            uploadedFile
              ? "border-emerald-300 bg-emerald-50"
              : isDragging
              ? "border-[#1a56db] bg-blue-50"
              : "border-[#cbd5e1] bg-white hover:border-[#1a56db] hover:bg-blue-50/30"
          }`}
        >
          {uploadedFile ? (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-sm font-bold text-emerald-700">{uploadedFile.name}</div>
              <div className="text-xs text-emerald-500 mt-1">Berkas siap untuk diarsipkan</div>
              <button
                onClick={() => { setUploadedFile(null); setUploadStep(0); }}
                className="mt-3 text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
              >
                <X style={{ width: 11, height: 11 }} /> Hapus
              </button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Upload style={{ width: 24, height: 24, color: "#1a56db" }} />
              </div>
              <div className="text-sm font-bold text-slate-700">Seret & Lepas Berkas di Sini</div>
              <div className="text-xs text-slate-400 mt-1.5 mb-3">Format yang didukung: PDF · Maks. ukuran 25 MB</div>
              <label className="bg-[#1a56db] text-white text-xs font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-[#1d4ed8] transition-colors">
                Atau Pilih Berkas
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.type !== "application/pdf") {
                      toast.error("Hanya file PDF yang diperbolehkan.");
                      return;
                    }
                    if (file.size > 25 * 1024 * 1024) {
                      toast.error("Ukuran file maksimal 25 MB.");
                      return;
                    }
                    setUploadedFile(file);
                    setUploadStep(1);
                  }}
                />
              </label>
            </>
          )}
        </div>

        {/* Metadata form */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <div className="flex items-center gap-2 mb-5">
            <FileText style={{ width: 15, height: 15, color: "#1a56db" }} />
            <h3 className="text-sm font-bold text-[#0f1c2e]">Metadata Dokumen</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nomor Surat *" placeholder="contoh: 005/1234/DS-X/2024" value={formData.nomorSurat} onChange={(v) => update("nomorSurat", v)} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Tanggal Surat *</label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => update("tanggal", e.target.value)}
                className="border border-[#e2e8f0] rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] bg-white"
              />
            </div>
            <FormField label="Perihal Surat *" placeholder="Deskripsi singkat isi surat" value={formData.perihal} onChange={(v) => update("perihal", v)} className="col-span-2" />
            <SelectField
              label="Jenis Dokumen *"
              value={formData.jenis}
              onChange={(v) => update("jenis", v)}
              opts={["Surat Masuk", "Surat Keluar", "SK Internal", "Memo", "Nota Dinas", "Berita Acara"]}
            />
            <SelectField
              label="Kategori *"
              value={formData.kategori}
              onChange={(v) => update("kategori", v)}
              opts={["Perizinan", "Keuangan", "Kepegawaian", "Pengadaan", "Aset", "Audit", "Umum"]}
            />
            <SelectField
              label="Tingkat Prioritas *"
              value={formData.prioritas}
              onChange={(v) => update("prioritas", v)}
              opts={["Normal", "Tinggi", "Rahasia"]}
            />
          </div>
        </div>

        {/* Physical location */}
        <div className="bg-white rounded-xl border border-amber-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <MapPin style={{ width: 15, height: 15, color: "#d97706" }} />
            <h3 className="text-sm font-bold text-[#0f1c2e]">Lokasi Penyimpanan Fisik</h3>
            <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">WAJIB DIISI</span>
          </div>
          <p className="text-xs text-slate-400 mb-5 pl-5">Tentukan lokasi fisik arsip cetak agar mudah ditemukan kembali</p>
          <div className="grid grid-cols-3 gap-4">
            <SelectField
              label="Lemari / Kabinet *"
              value={formData.lemari}
              onChange={(v) => update("lemari", v)}
              opts={["Lemari A", "Lemari B", "Lemari C", "Lemari D"]}
              accent
            />
            <SelectField
              label="Rak / Laci *"
              value={formData.rak}
              onChange={(v) => update("rak", v)}
              opts={["Rak ke-1", "Rak ke-2", "Rak ke-3", "Rak ke-4", "Rak ke-5"]}
              accent
            />
            <FormField label="Ordner / Binder *" placeholder="cth: Ordner Merah — 2024/I" value={formData.ordner} onChange={(v) => update("ordner", v)} accent />
          </div>
          <div className="mt-4">
            <FormField label="Keterangan Tambahan" placeholder="Catatan fisik lainnya (opsional)" value={formData.keterangan} onChange={(v) => update("keterangan", v)} />
          </div>
        </div>

        {/* Sticky save button */}
        <div className="sticky bottom-0 bg-[#f4f6f9] py-4 flex items-center justify-between border-t border-[#e2e8f0] -mx-7 px-7 mt-6">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <AlertCircle style={{ width: 12, height: 12 }} />
            Field bertanda * wajib diisi sebelum menyimpan
          </div>
          <div className="flex items-center gap-3">
            <button className="border border-[#e2e8f0] text-slate-600 text-sm font-medium px-5 py-2.5 rounded-md hover:bg-white transition-colors">
              Simpan Draf
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="text-sm font-bold px-7 py-2.5 rounded-md transition-all flex items-center gap-2 shadow-md bg-[#1a56db] text-white hover:bg-[#1d4ed8] shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Menyimpan..." : <><Archive style={{ width: 15, height: 15 }} /> Simpan & Arsipkan</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
