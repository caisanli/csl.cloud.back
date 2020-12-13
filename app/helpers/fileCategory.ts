
/** 
 * old
 * 0：其它
 * 1：图片
 * 2：字体
 * 3：文档
 * 4：压缩包
 * 5：电子书
 * 6：视频
 * 7：音频
 */
/**
 * new
 * 0：其它
 * 1：图片
 * 2：文档
 * 3：音乐
 * 4：视频
 */
const image = ['3FR','ARM','AVIF','BMP','CR2','CRW','CUR','DCM','DCR','DDS','ERF','EXR','FAX','FTS','G3','G4','GIF','GC','HDR','HEIC','HEIF','HRZ','ICO','IIQ','IPL','JBG','JBIG','JFI','JFIF','JIF','JNX','JP2','JPE','JPEG','JPG','JPS','K25','KDC','MAC','MAP','MEF','MNG','MRW','MTV','NEF','NRW','OEF','OTB','PAL','PALW','PAM','PBM','PCD','PCT','PCX','PDB','PEF','PES','PFM','PGM','PGX','PICON','PICT','PIX','PLASMA','PNG','PNM','PPM','PSD','PWP','RAF','RAS','RGB','RGBA','RGBO','RGF','RGF','RLA','RLE','RW2','SCT','SFW','SGI','SIX','SIXEL','SR2','SRF','SUN','SVG','TGA','TIFF','TIM','TM2','UYVY','VIFF','VIPS','VIPS','WBMP','WEBP','WMZ','WPG','X3F','XBM','XC','XCF','XPM','XV','XWD','YUV'];
const fonts = ['AFM','BIN','CFF','CID','DFONT','OTF','PFA','PFB','PS','PT3','SFD','T11','T42','TTF','UFO','WOFF'];
const ebook = ['ZAW3', 'EPUB', 'FB2', 'LRF', 'MOBI', 'PDB', 'RB', 'SNB', 'TCR'];
const document = ['ABW', 'AW', 'CSV', 'DBK', 'DJVU', 'DOC', 'DOCM', 'DOCX', 'DOT', 'DOTM', 'DOTX', 'HTML', 'KWD', 'ODT', 'OXPS', 'PDF', 'RTF', 'SXW', 'TXT', 'WPS', 'XLS', 'XLSX', 'XPS'];
const zip = ['7Z', 'ACE', 'ALZ', 'ARC', 'ARJ', 'CAB', 'CPIO', 'DEB', 'JAR', 'LHA', 'RAR', 'RPM', 'TAR', 'TBZ2', 'TGZ', 'ZIP'];
const video = ['3G2', '3GP', 'AAF', 'ASF', 'AV1', 'AVCHD', 'AVI', 'CAVS', 'DIVX', 'DV', 'F4V', 'FLV', 'HEVC', 'M2TS', 'M2V', 'M4V', 'MJPEG', 'MKV', 'MOD', 'MOV', 'MP4', 'MPEG', 'MPEG-2', 'MPG', 'MTS', 'MXF', 'OGV', 'RM', 'RMVB', 'SWF', 'TOD', 'TS', 'VOB', 'WEBM', 'WMV', 'WTV', 'XVID'];
const audio = ['8SVX', 'AAC', 'AC3', 'AIFF', 'AMB', 'AMR', 'APE', 'AU', 'AVR', 'CAF', 'CDDA', 'CVS', 'CVSD', 'CVU', 'DSS', 'DTS', 'DVMS', 'FAP', 'FLAC', 'FSSD', 'GSM', 'GSRT', 'HCOM', 'HTK', 'IMA', 'IRCAM', 'M4A', 'M4R', 'MAUD', 'MP2', 'MP3', 'NIST', 'OGA', 'OGG', 'OPUS', 'PAF', 'PRC', 'PVF', 'RA', 'SD2', 'SHN', 'SLN', 'SMP', 'SND', 'SNDR', 'SNDT', 'SOU', 'SPH', 'SPX', 'TAK', 'TTA', 'TXW', 'VMS', 'VOC', 'VOX', 'VQF', 'W64', 'WAV', 'WMA', 'WV', 'WVE', 'XA'];
export default {
    '1' : image,
    '2': document.concat(ebook),
    '3': audio,
    '4': video,
    '0': zip.concat(fonts)
}