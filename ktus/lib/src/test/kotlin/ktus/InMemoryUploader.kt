package ktus

import java.io.InputStream
import java.time.Duration
import java.time.Instant
import java.util.*
import kotlin.collections.HashMap

data class Uploading(val expiration: Instant, val contents: ByteArray?)

/**
 * Upload contents to memory.
 */
class InMemoryUploader(var store: HashMap<String, Uploading>) : TusUploader {

    private val expiration = Duration.ofHours(6)

    override fun getUploaderConfigurations() = TusUploaderConfigurations(10 * 1024 * 1024)

    override fun getExpiredDateOfUploading(id: String) = store[id]?.expiration

    override fun uploadingIsExist(id: String) = store.containsKey(id)

    override fun terminateUploading(id: String) {
        store.remove(id)
    }

    override fun getLengthOfBytes(id: String) = store[id]!!.contents?.size?.toLong() ?: 0

    override fun uploadingIsExpired(id: String, currentInstant: Instant) = store[id]!!.expiration < currentInstant

    override fun createNewUpload(id: String, contents: InputStream?): Long {
        val contentsBytes = contents?.readAllBytes()
        store[id] = Uploading(Instant.now() + expiration, contentsBytes)
        return contentsBytes?.size?.toLong() ?: 0L
    }

    override fun appendContentsToExistFile(id: String, contents: InputStream): Long {
        val (currentExpiration, currentContents) = store[id]!!
        val contentsBytes = contents?.readAllBytes()
        store[id] = Uploading(
            currentExpiration + expiration,
            if (currentContents != null) currentContents + contentsBytes else contentsBytes
        )
        return contentsBytes.size.toLong()
    }

    override fun generateUploadingId(): String = UUID.randomUUID().toString().replace("-", "")

    fun changeUploadingExpiration(id: String, newExpiration: Instant) {
        if (store.containsKey(id)) {
            val (_, currentContents) = store[id]!!
            store[id] = Uploading(newExpiration, currentContents)
        }
    }
}
