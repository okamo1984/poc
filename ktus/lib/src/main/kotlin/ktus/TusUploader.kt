package ktus

import java.io.InputStream
import java.time.Instant

/**
 * A tus uploader configurations.
 */
data class TusUploaderConfigurations(val maxSize: Long)

/**
 * An uploader for tus.
 */
interface TusUploader {

    /**
     * Generate new uploading id.
     *
     * @return the uploading id.
     */
    fun generateUploadingId(): String

    /**
     * Create new file.
     *
     * @param id the uploading id.
     * @param contents the upload contents.
     * @return the content length.
     */
    fun createNewUpload(id: String, contents: InputStream? = null): Long

    /**
     * Append contents to exist file.
     *
     * @param id the uploading id.
     * @param contents the upload contents.
     * @return the appended content length.
     */
    fun appendContentsToExistFile(id: String, contents: InputStream): Long

    /**
     * Get length of bytes for uploaded file.
     *
     * @param id the uploaded id.
     * @return the length of bytes.
     */
    fun getLengthOfBytes(id: String): Long

    /**
     * Return uploader configurations.
     *
     * @return the tus uploader configurations
     */
    fun getUploaderConfigurations(): TusUploaderConfigurations

    /**
     * Return expire of specific uploading.
     *
     * @param id the uploading id.
     * @return the expired date.
     */
    fun getExpiredDateOfUploading(id: String): Instant?

    /**
     * Confirm uploading file is exist.
     *
     * @param id the uploading id.
     * @return true if uploading file is exist.
     */
    fun uploadingIsExist(id: String): Boolean

    /**
     * Terminate uploading file.
     *
     * @param id the uploading id.
     */
    fun terminateUploading(id: String)

    /**
     * Confirm uploading is expired.
     *
     * @param id the uploading id.
     * @param currentInstant the current instant whose time zone is UTC.
     * @return true if uploading is expired.
     */
    fun uploadingIsExpired(id: String, currentInstant: Instant): Boolean
}
